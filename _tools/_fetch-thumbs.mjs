import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 选图工具：把候选图的小尺寸版本下到 _candidates/thumbs/，供人工挑选。
 * ----------------------------------------------------------------------------
 * 换首页配图时的工作流：
 *   1. 改本文件下面的 PICKS（指定 NASA ID）或 QUERIES（按关键词检索）
 *   2. node _tools/_fetch-thumbs.mjs
 *   3. python _tools/_contact-sheet.py        → 拼成带编号的拼版图，一次看完
 *      python _tools/_contact-sheet.py 3 1,4,7  → 只看其中几张，放大排
 *   4. 选中的写进 fetch-candidates.mjs 的 IDS，再跑 build-about-images.py
 *
 * 只下 ~thumb（约 640px），够看构图就行；定稿后再取大图。
 * NASA 图片库检索入口：https://images-api.nasa.gov/search?q=<关键词>&media_type=image
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_candidates', 'thumbs');
mkdirSync(OUT, { recursive: true });

const UA = { 'User-Agent': 'lab-homepage/1.0 (educational lab site)' };

/** NASA 返回的资源地址里混有 http://，一律升级到 https；顺带对网络抖动重试 */
async function get(url, binary = false, tries = 4) {
  const fixed = url.replace(/^http:\/\//, 'https://');
  let lastErr;
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(fixed, { headers: UA, signal: AbortSignal.timeout(45000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

/** 指定要看的候选（按四个方向分组） */
const PICKS = [
  ['01-multi-thermalIR', 'PIA03482'],
  ['02-multi-IRvsVIS', 'PIA03461'],
  ['03-multi-colorIR', 'PIA03484'],
  ['04-multi-spectrogram', 'PIA25044'],
  ['05-4d-perspective', 'PIA17076'],
  ['06-4d-relief-height', 'PIA06661'],
  ['07-4d-dem-mercury', 'PIA17385'],
  ['08-4d-landsat-srtm', 'PIA03373'],
  ['09-4d-aster-gdem', 'PIA12090'],
  ['10-embodied-robonaut-a', 'iss030e135157'],
  ['11-embodied-robonaut-b', 'iss030e135148'],
  ['12-embodied-rover-wheel', 'KSC-20200402-PH-JPL01_0003'],
  ['13-embodied-rover-art', 'PIA24343'],
  ['14-rs-pearl-delta', 'GSFC_20171208_Archive_e001699'],
  ['15-rs-istanbul', 'GSFC_20171208_Archive_e001704'],
  ['16-rs-ontario', 'GSFC_20171208_Archive_e001703'],
  ['17-rs-tokyo', 'GSFC_20171208_Archive_e001701'],
];

/** 额外按关键词检索，取每个词的前 3 张一起看 */
const QUERIES = [
  'radar image',
  'SIR-C',
  'ship port harbor',
  'airport satellite',
];

const meta = [];

async function grab(id, tag) {
  try {
    const raw = await get(`https://images-api.nasa.gov/asset/${id}`);
    const files = (JSON.parse(raw)?.collection?.items ?? []).map((i) => i.href);
    const pick =
      files.find((f) => f.endsWith('~thumb.jpg')) ??
      files.find((f) => f.endsWith('~small.jpg')) ??
      files.find((f) => f.endsWith('~medium.jpg'));
    if (!pick) return console.log(`  ✗ ${id} 没有可用尺寸`);

    const buf = await get(pick, true);
    writeFileSync(join(OUT, `${tag}-${id}.jpg`), buf);

    const m = JSON.parse(await get(`https://images-api.nasa.gov/search?nasa_id=${id}&media_type=image`));
    const d = m?.collection?.items?.[0]?.data?.[0] ?? {};
    meta.push({ tag, id, title: d.title ?? '', center: d.center ?? '', date: (d.date_created ?? '').slice(0, 10) });
    console.log(`  ✓ ${tag}-${id}.jpg  ${(buf.length / 1024).toFixed(0)} KB  ${d.title}`);
  } catch (e) {
    console.log(`  ✗ ${id}  ${e.message}`);
  }
}

console.log('下载候选缩略图…\n');
for (const [tag, id] of PICKS) await grab(id, tag);

console.log('\n按关键词补充检索…\n');
for (const q of QUERIES) {
  try {
    const raw = await get(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=4`,
    );
    const items = JSON.parse(raw)?.collection?.items ?? [];
    console.log(`「${q}」 → ${items.length} 条`);
    for (const it of items) {
      const id = it.data?.[0]?.nasa_id;
      if (id) await grab(id, `q-${q.replace(/\W+/g, '')}`);
    }
  } catch (e) {
    console.log(`「${q}」检索失败：${e.message}`);
  }
}

writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
console.log(`\n共 ${meta.length} 张，元信息写入 _candidates/thumbs/meta.json`);