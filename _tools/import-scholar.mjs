/**
 * 把 Google Scholar 的论文列表转成 src/data/publications.ts。
 *
 * 数据来自 _tools/scholar-raw.json（由浏览器从杨曦老师的 Google Scholar 主页抓取，
 * 见 README「论文成果」一节的重抓步骤）。本脚本只做三件**规范化**的事：
 *
 *   1. 清洗 venue：去掉 Google Scholar 列表里附带的年份/卷号/期号/页码，
 *      只留下期刊或会议的本名。**不改写期刊名本身**，只修 Google Scholar
 *      在列表里显示不全导致的截断（见 TRUNCATED 表）。
 *   2. 去重：同一篇论文 Google Scholar 有时同时收录中英文两条记录
 *      （卷号、期号、页码、年份完全相同），只保留一条。
 *   3. 按被引次数把前 N 篇标为代表性论文（`selected`）。**这是启发式建议，请人工复核。**
 *
 * 作者顺序、标题、年份一律保持 Google Scholar 原文，不做任何改动。
 * 注意：论文页现在**只按年份分组展示**，不再按研究方向分类 —— 所以脚本不产出 topic 字段。
 *
 * 用法：node _tools/import-scholar.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '_tools', 'scholar-raw.json');
const TARGET = path.join(ROOT, 'src', 'data', 'publications.ts');

const MIN_YEAR = 2022;
const SELECTED_COUNT = 8;

/* ───────────────────── 1. venue 规范化 ───────────────────── */

/**
 * Google Scholar 列表里被截断的期刊/会议名。
 * 只有这三个是「名字本身被截断」，其余截断都发生在卷号页码部分，
 * 清洗掉数字之后就自动完整了。
 */
const TRUNCATED = new Map(
  Object.entries({
    'ieee/cvf conference on computer vision and pattern recognition (cvpr':
      'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)',
    'ieee journal of selected topics in applied earth observations and remote':
      'IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing',
  }).map(([k, v]) => [k.toLowerCase(), v]),
);

/** 期刊名大小写不统一（同一本刊有时全小写），统一到规范写法 */
const CANONICAL = new Map(
  [
    'IEEE Transactions on Image Processing',
    'IEEE Transactions on Circuits and Systems for Video Technology',
    'IEEE Transactions on Multimedia',
    'IEEE Transactions on Geoscience and Remote Sensing',
    'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    'IEEE Transactions on Information Forensics and Security',
    'IEEE Transactions on Neural Networks and Learning Systems',
    'IEEE Transactions on Cybernetics',
    'IEEE Transactions on Affective Computing',
    'IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing',
    'Pattern Recognition',
    'Neural Networks',
    'Neurocomputing',
    'Remote Sensing',
    'Journal of Information and Intelligence',
  ].map((name) => [name.toLowerCase(), name]),
);

function cleanVenue(raw) {
  let v = raw;

  // 去掉列表里的省略号
  v = v.replace(/\s*(?:…|\.\.\.)\s*$/, '');

  // 去掉开头的年份（形如 "2021 IEEE/CVF …"）
  v = v.replace(/^\s*\d{4}\s+/, '');

  // arXiv 的编号（arXiv:2309.07866）长得像「卷号.页码」，会被下面的规则吃掉，
  // 所以这一类直接跳过数字清洗。
  if (/arxiv/i.test(v)) {
    return v.replace(/[\s,，]+$/, '').trim();
  }

  // 反复剥离尾部的数字尾巴，覆盖以下形态：
  //   ", 123-456"          纯页码
  //   " 12, 123-456"       卷号 + 页码
  //   " 34 (11), 123-456"  卷号 + 期号 + 页码
  //   " 15 (17), 4321"     卷号 + 期号 + 文章号
  //   " 12"                只有卷号
  //   ", 107946"           文章号（Neural Networks / Pattern Recognition 这类）
  for (let i = 0; i < 4; i++) {
    const before = v;
    v = v.replace(/[\s,]*\(\s*\d+\s*\)\s*,\s*[\d\-–]+\s*$/, ''); // 卷 (期), 页
    v = v.replace(/[\s,]*\d+\s*,\s*[\d\-–]+\s*$/, '');            // 卷, 页
    v = v.replace(/[\s,]*[\d\-–]+\s*$/, '');                       // 只剩页码
    v = v.replace(/[\s,]*\(\s*\d+\s*\)\s*$/, '');                  // 只剩期号
    if (v === before) break;
  }

  // Scholar 有时把名字本身也截断了，会留下未闭合的括号，例如
  //   "IEEE Transactions on Circuits and Systems for Video Technology 34 (11 …"
  // 上面的规则处理不了这种（缺右括号），这里兜底把残缺部分去掉。
  v = v.replace(/[\s,]*\([^)]*$/, '');  // 未闭合的括号及其后内容
  v = v.replace(/[\s,]*\d+\s*$/, '');   // 残留的卷号
  v = v.replace(/[\s,（(]+$/, '');       // 结尾残留的标点

  // 去掉尾部多余的逗号与空白
  v = v.replace(/[\s,，]+$/, '').trim();

  // 修补被截断的名字
  const fixed = TRUNCATED.get(v.toLowerCase());
  if (fixed) return fixed;

  // 统一期刊名大小写
  return CANONICAL.get(v.toLowerCase()) ?? v;
}

/** venue 尾部的数字（卷/期/页），去重时用来判断是不是同一条记录 */
function numericTail(raw) {
  const m = raw.match(/(\d+\s*(?:\(\s*\d+\s*\))?\s*,\s*[\d\-–]+)\s*$/);
  return m ? m[1].replace(/\s+/g, ' ') : '';
}

/* ───────────────────── 2. 去重 ───────────────────── */

const CJK = /[\u3400-\u9fff]/;

/** 作者人数。中文记录用的是全角逗号「，」，所以要两种逗号都算 */
function authorCount(authors) {
  return authors.split(/[,，]/).filter((s) => s.trim()).length;
}

/**
 * 去重**只处理一种情况**：同一篇论文在 Google Scholar 上同时存在中文与英文两条
 * 记录（卷号、期号、页码、年份完全相同）。
 *
 * 为什么规则要这么窄：一开始我用「年份 + 卷期页」做键，结果误删了 3 篇真实论文 ——
 * IEEE TGRS 这类期刊的文章号形如 "60, 1-12"，同卷不同论文会重复出现，
 * 所以这个键本身不足以判定重复。
 *
 * 因此加了三个必要条件：
 *   ① 年份 + 卷期页完全相同
 *   ② 一条含中日韩字符、另一条纯 ASCII（中英双记录的特征）
 *   ③ 作者人数相同
 * 保留中文那条。任何一条不满足就都保留，宁可留着重复，也不能删掉真论文。
 */
function dedupe(items) {
  const index = new Map();
  const kept = [];
  const dropped = [];

  for (const item of items) {
    const tail = numericTail(item.venueRaw);
    const key = `${item.year}|${tail}`;
    const prev = tail ? index.get(key) : undefined;

    const isPair =
      prev &&
      CJK.test(`${prev.title}${prev.authors}`) !== CJK.test(`${item.title}${item.authors}`) &&
      authorCount(prev.authors) === authorCount(item.authors);

    if (isPair) {
      dropped.push({ kept: prev, dropped: item });
      continue;
    }

    if (tail && !index.has(key)) index.set(key, item);
    kept.push(item);
  }
  return { kept, dropped };
}

/* ─────────────── 3. 代表性论文（按被引次数） ─────────────── */

/**
 * 只按被引次数把前 N 篇标为 `selected`。
 *
 * 这里**曾经**还有一套按关键词给论文归方向（topic）的逻辑，后来按要求去掉了 ——
 * 论文页现在只按年份分组展示，不做方向分类。如果以后想恢复「按方向筛选」，
 * 可以重新加一套规则（思路是：只用 SAR / remote sensing / few-shot 这类
 * 高置信度关键词，宁缺毋滥），但要注意那套规则给的只是**建议值**，必须人工复核。
 */

/* ───────────────────── 主流程 ───────────────────── */

if (!fs.existsSync(SRC)) {
  console.error(`找不到 ${path.relative(ROOT, SRC)}。`);
  console.error('先按 README「论文成果」一节的说明重新抓取 Google Scholar 列表。');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const items = raw
  .map((r) => ({
    ...r,
    venueRaw: r.venue,
    venue: cleanVenue(r.venue),
    year: Number(r.year),
    cited: Number(r.cited) || 0,
  }))
  .filter((r) => r.year >= MIN_YEAR && r.title)
  .sort((a, b) => b.year - a.year || b.cited - a.cited);

const { kept, dropped } = dedupe(items);

// 按被引次数挑代表性论文
const selectedTitles = new Set(
  [...kept].sort((a, b) => b.cited - a.cited).slice(0, SELECTED_COUNT).map((r) => r.title),
);

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\s+/g, ' ').trim();

const entries = kept.map((r) => {
  const lines = [
    `    authors: '${esc(r.authors)}',`,
    `    title: '${esc(r.title)}',`,
    `    venue: '${esc(r.venue)}',`,
    `    year: ${r.year},`,
  ];
  if (selectedTitles.has(r.title)) lines.push('    selected: true,');
  if (r.href) lines.push(`    links: [{ kind: 'scholar', url: '${esc(r.href)}' }],`);
  return `  {\n${lines.join('\n')}\n  },`;
});

const src = fs.readFileSync(TARGET, 'utf8');
const startMark = 'export const publications: Publication[] = [';
const endMark = '];\n\n/* ─────────────────────────── 工具函数';
const start = src.indexOf(startMark);
const end = src.indexOf(endMark);
if (start < 0 || end < 0) {
  console.error('没能在 publications.ts 里定位到 publications 数组。');
  process.exit(1);
}

const header = `  // 由 _tools/import-scholar.mjs 从 Google Scholar 导出（抓取日：${new Date().toISOString().slice(0, 10)}）
  // 共 ${kept.length} 条，${MIN_YEAR} 年及以后；作者/标题/年份保持 Google Scholar 原文
  // topic 与 selected 是脚本按关键词和被引次数给的**建议值**，请人工复核`;

fs.writeFileSync(
  TARGET,
  src.slice(0, start + startMark.length) + `\n${header}\n` + entries.join('\n') + '\n' + src.slice(end),
  'utf8',
);

/* ───────────────────── 报告 ───────────────────── */

const byYear = {};
for (const r of kept) byYear[r.year] = (byYear[r.year] || 0) + 1;

console.log(`✓ 导入 ${kept.length} 条（${MIN_YEAR} 年及以后），已写入 src/data/publications.ts\n`);
console.log('年份分布：', JSON.stringify(byYear));

if (dropped.length > 0) {
  console.log(`\n去重去掉 ${dropped.length} 条（同一篇论文的中英文两条记录，保留了中文那条）：`);
  for (const d of dropped) {
    console.log(`  · 保留：${d.kept.title}`);
    console.log(`    去掉：${d.dropped.title}`);
  }
}

console.log(`\n标为代表性论文的 ${SELECTED_COUNT} 篇（按被引次数）：`);
[...kept]
  .sort((a, b) => b.cited - a.cited)
  .slice(0, SELECTED_COUNT)
  .forEach((r) => console.log(`  [${r.year}] 被引 ${String(r.cited).padStart(4)}  ${r.title.slice(0, 70)}`));

console.log('\nvenue 规范化前后对照（随机 8 条，请抽查）：');
const step = Math.max(1, Math.floor(kept.length / 8));
kept.filter((_, i) => i % step === 0).slice(0, 8).forEach((r) => {
  if (r.venueRaw !== r.venue) console.log(`  ${r.venueRaw}\n    → ${r.venue}`);
});

console.log('\n下一步：复核 topic 与 selected，然后 npm run build。');