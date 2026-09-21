import fs from 'node:fs';

const s = fs.readFileSync('src/data/publications.ts', 'utf8');
const start = s.indexOf('export const publications');
const block = s.slice(start, s.indexOf('];', start));
const lines = block.split('\n');

console.log('=== 可疑 venue（末尾还有数字或括号）===');
let found = 0;
lines.forEach((l, n) => {
  const m = l.match(/venue: '((?:[^'\\]|\\.)*)'/);
  if (!m) return;
  const v = m[1];
  if (/[0-9]\s*$/.test(v) || /\(\s*$/.test(v) || v.includes('…')) {
    console.log(`  行 ${n}: ${JSON.stringify(v)}`);
    found++;
  }
});
if (found === 0) console.log('  （无）');

console.log('\n=== 所有 venue 去重清单 ===');
const venues = [...new Set(lines.map((l) => (l.match(/venue: '((?:[^'\\]|\\.)*)'/) ?? [])[1]).filter(Boolean))];
venues.sort().forEach((v) => console.log('  ' + v));

console.log(`\n共 ${venues.length} 个不同的 venue`);
console.log('=== 条目结构抽样 ===');
const idx = block.indexOf('  {');
console.log(block.slice(idx, idx + 420));