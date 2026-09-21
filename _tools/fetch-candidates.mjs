/**
 * 下载首页配图的原始素材（NASA 图片库，公有领域）
 * ----------------------------------------------------------------------------
 * 四格**分别对应实验室的四个研究方向**：
 *   sts059-s-086                    Flevoland 三频假彩色 SAR
 *     → ① 多源数据智能分析（三个频段合成，本身就是「多源」）
 *   GSFC_20171208_Archive_e001700   拉斯维加斯 1984 / 2010 两期光学影像（上下双面板）
 *     → ② 四维场景生成理解（同一场景随时间演化，切成两张做成交叉淡入的动态效果）
 *   iss030e148256                   Robonaut 2 人形机器人
 *     → ③ 具身智能与智能体
 *   GSFC_20171208_Archive_e001701   Landsat View: Tokyo（城市 + 东京湾，上下两期）
 *     → ④ 遥感目标智能感知
 *
 * 产物：
 *   _candidates/<NASA-ID>.jpg     原始素材（中间文件，可随时删）
 *   _candidates/sources.json      标题/机构/日期等元信息，供 build 脚本写版权说明
 *
 * 用法：node _tools/fetch-candidates.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_candidates');

/** NASA 媒体使用指南：https://www.nasa.gov/nasa-brand-center/images-and-media/ */
const IDS = [
  'sts059-s-086',
  'GSFC_20171208_Archive_e001700',
  'iss030e148256',
  'GSFC_20171208_Archive_e001701',
];

const UA = { 'User-Agent': 'lab-homepage/1.0 (educational; lab site)' };

async function json(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

mkdirSync(OUT, { recursive: true });
const sources = [];

for (const id of IDS) {
  // 1) 元信息
  const meta = await json(`https://images-api.nasa.gov/search?nasa_id=${id}&media_type=image`);
  const d = meta?.collection?.items?.[0]?.data?.[0] ?? {};

  // 2) 资源列表，优先 ~medium（约 1000px 长边，够 640×480 用）
  const assets = await json(`https://images-api.nasa.gov/asset/${id}`);
  const files = (assets?.collection?.items ?? []).map((i) => i.href);
  const pick =
    files.find((f) => f.endsWith('~medium.jpg')) ??
    files.find((f) => f.endsWith('~large.jpg')) ??
    files.find((f) => f.endsWith('~orig.jpg'));
  if (!pick) throw new Error(`${id} 没有可用的 jpg`);

  const buf = Buffer.from(await (await fetch(pick, { headers: UA })).arrayBuffer());
  writeFileSync(join(OUT, `${id}.jpg`), buf);

  sources.push({
    id,
    file: `${id}.jpg`,
    title: d.title ?? '',
    center: d.center ?? 'NASA',
    date: (d.date_created ?? '').slice(0, 10),
    credit: d.photographer ?? d.center ?? 'NASA',
    page: `https://images.nasa.gov/details-${id}`,
  });
  console.log(`✓ ${id}.jpg  ${(buf.length / 1024).toFixed(0)} KB   ${d.title}`);
}

writeFileSync(join(OUT, 'sources.json'), JSON.stringify(sources, null, 2), 'utf8');
console.log(`\n共 ${sources.length} 张，元信息写入 _candidates/sources.json`);
console.log('下一步：python _tools/build-about-images.py');