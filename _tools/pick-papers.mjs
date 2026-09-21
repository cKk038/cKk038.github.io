import fs from 'node:fs';

const s = fs.readFileSync('src/data/publications.ts', 'utf8');
const start = s.indexOf('export const publications');
const block = s.slice(start, s.indexOf('];', start));

/* 逐行解析，比一个大正则稳得多 */
const entries = [];
let cur = null;
for (const line of block.split('\n')) {
  const t = line.trim();
  if (t === '{') {
    cur = {};
    continue;
  }
  if (!cur) continue;
  const grab = (key) => (t.match(new RegExp(`^${key}: '((?:[^'\\\\]|\\\\.)*)'`)) ?? [])[1];
  if (t.startsWith('authors:')) cur.authors = grab('authors');
  else if (t.startsWith('title:')) cur.title = grab('title');
  else if (t.startsWith('venue:')) cur.venue = grab('venue');
  else if (t.startsWith('year:')) cur.year = Number((t.match(/year: (\d+)/) ?? [])[1]);
  else if (t.startsWith('topic:')) cur.topic = grab('topic');
  else if (t.startsWith('selected:')) cur.selected = /true/.test(t);
  else if (t === '},') {
    entries.push(cur);
    cur = null;
  }
}

console.log(`解析到 ${entries.length} 条`);

/* venue 自检 */
const venues = [...new Set(entries.map((e) => e.venue).filter(Boolean))].sort();
const bad = venues.filter((v) => /[0-9]\s*$/.test(v) || /\(\s*$/.test(v));
console.log(`venue 去重后 ${venues.length} 个，仍可疑的：${bad.length ? bad.join(' | ') : '无 ✓'}`);
console.log('TCSVT：' + venues.filter((v) => v.includes('Circuits')).map((v) => JSON.stringify(v)).join(' , '));

/* 每个方向按被引次数排序 */
const raw = JSON.parse(fs.readFileSync('_tools/scholar-raw.json', 'utf8'));
const cited = new Map(raw.map((r) => [r.title, Number(r.cited) || 0]));

const byTopic = {};
for (const e of entries) {
  if (!e.topic) continue;
  (byTopic[e.topic] ??= []).push({ ...e, cited: cited.get(e.title) ?? 0 });
}

for (const [topic, list] of Object.entries(byTopic)) {
  list.sort((a, b) => b.cited - a.cited || b.year - a.year);
  console.log(`\n${'='.repeat(80)}\n方向 ${topic}   共 ${list.length} 篇\n${'='.repeat(80)}`);
  list.slice(0, 4).forEach((e, i) => {
    console.log(`  ${i + 1}. 被引 ${String(e.cited).padStart(4)}  ${e.year}  ${e.venue}`);
    console.log(`     ${e.title}`);
    console.log(`     ${e.authors.slice(0, 96)}`);
  });
}

/* 未归类的条目里，有哪些值得关注（用于首页配图的领域多样性）*/
const untagged = entries.filter((e) => !e.topic).map((e) => ({ ...e, cited: cited.get(e.title) ?? 0 }));
untagged.sort((a, b) => b.cited - a.cited);
console.log(`\n${'='.repeat(80)}\n未归类里被引最高的 12 篇（看实验室的领域分布）\n${'='.repeat(80)}`);
untagged.slice(0, 12).forEach((e, i) => {
  console.log(`  ${i + 1}. 被引 ${String(e.cited).padStart(4)}  ${e.year}  ${e.venue}`);
  console.log(`     ${e.title}`);
});