/**
 * 用 OpenAlex 按标题取摘要（之前查作者时这个 API 是通的）。
 * OpenAlex 的摘要存成倒排索引，需要还原成文本。
 */
const UA = { 'User-Agent': 'lab-homepage/1.0 (mailto:yangx@xidian.edu.cn)' };

const TITLES = [
  ['remote', 'Object detection for aerial images with feature enhancement and soft label assignment'],
  ['multi', 'Cooperative separation of modality shared-specific features for visible-infrared person re-identification'],
  ['threeD', 'Point deformable network with enhanced normal embedding for point cloud analysis'],
  ['fewshot', 'Hyperbolic insights with knowledge distillation for cross-domain few-shot learning'],
];

/** 倒排索引 → 正常文本 */
function unindex(inv) {
  if (!inv) return '';
  const slots = [];
  for (const [word, positions] of Object.entries(inv)) {
    for (const p of positions) slots[p] = word;
  }
  return slots.filter(Boolean).join(' ');
}

for (const [key, title] of TITLES) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(title)}&per_page=3&mailto=yangx@xidian.edu.cn`;
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) {
      console.log(`\n### ${key}  → HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const w = data.results?.[0];
    if (!w) {
      console.log(`\n### ${key}  → 没找到`);
      continue;
    }
    console.log(`\n${'='.repeat(80)}`);
    console.log(`### ${key}   ${w.publication_year}  ${w.primary_location?.source?.display_name ?? ''}`);
    console.log(`标题: ${w.title}`);
    console.log(`DOI: ${w.doi ?? '-'}   OpenAlex: ${w.id}`);
    console.log(`作者: ${(w.authorships ?? []).map((a) => a.author.display_name).slice(0, 8).join(', ')}`);
    const abs = unindex(w.abstract_inverted_index);
    console.log(`摘要: ${abs ? abs.slice(0, 1500) : '(OpenAlex 没有收录摘要)'}`);
  } catch (e) {
    console.log(`\n### ${key}  → 失败：${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1200));
}