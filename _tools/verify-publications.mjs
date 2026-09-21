import fs from 'node:fs';

const src = fs.readFileSync('src/data/publications.ts', 'utf8');
const arrayStart = src.indexOf('export const publications: Publication[] = [');
const arrayEnd = src.indexOf('];\n\n/* ─────────────────────────── 工具函数');
const block = src.slice(arrayStart, arrayEnd);

const entries = [...block.matchAll(/^  \{$/gm)].length;
const selected = [...block.matchAll(/selected: true/g)].length;
const scholarLinks = [...block.matchAll(/kind: 'scholar'/g)].length;
const topicLeft = [...block.matchAll(/^\s*topic:/gm)].length;

console.log('条目数        :', entries);
console.log('selected      :', selected);
console.log('Scholar 链接  :', scholarLinks);
console.log('残留 topic 字段:', topicLeft === 0 ? '✓ 已清除' : `⚠ ${topicLeft} 处`);

/* 标题 / 作者 / 年份的完整性 —— 逐条检查 */
const titles = [...block.matchAll(/title: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
const authors = [...block.matchAll(/authors: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
const venues = [...block.matchAll(/venue: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
const years = [...block.matchAll(/year: (\d{4})/g)].map((m) => Number(m[1]));

console.log('\n字段齐全性:');
console.log('  titles :', titles.length, titles.some((t) => !t.trim()) ? '⚠ 有空标题' : '✓');
console.log('  authors:', authors.length, authors.some((a) => !a.trim()) ? '⚠ 有空作者' : '✓');
console.log('  venues :', venues.length, venues.some((v) => !v.trim()) ? '⚠ 有空期刊' : '✓');
console.log('  years  :', years.length, `范围 ${Math.min(...years)}–${Math.max(...years)}`);

/* 重复标题（列出所有重复项） */
const seen = new Map();
titles.forEach((t, i) => {
  const k = t.toLowerCase();
  if (!seen.has(k)) seen.set(k, []);
  seen.get(k).push(i + 1);
});
const dupes = [...seen.entries()].filter(([, idx]) => idx.length > 1);
console.log('\n重复标题:', dupes.length === 0 ? '✓ 无' : `⚠ ${dupes.length} 组`);
dupes.forEach(([k, idx]) => console.log(`  [${idx.join(', ')}] ${k.slice(0, 70)}`));

/* 年份分布 */
const byYear = years.reduce((a, y) => ((a[y] = (a[y] || 0) + 1), a), {});
console.log('\n年份分布:', JSON.stringify(byYear));

/* 检查是否有 venue 仍带数字尾巴（清洗不彻底）。
   arXiv 的编号（arXiv:2309.07866）本身就是名字的一部分，不算残留。 */
const dirty = venues.filter((v) => !/arxiv/i.test(v) && (/[\d\-–]+\s*$/.test(v) || /…/.test(v)));
console.log('\nvenue 清洗残留:', dirty.length === 0 ? '✓ 无' : '⚠\n  ' + dirty.join('\n  '));

/* 检查是否混入了 2022 年之前的 */
const old = years.filter((y) => y < 2022);
console.log('2022 年之前的条目:', old.length === 0 ? '✓ 无' : `⚠ ${old.length} 条`);