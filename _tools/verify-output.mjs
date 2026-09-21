import fs from 'node:fs';

const files = ['dist/index.html', 'dist/en/index.html', 'dist/team/index.html', 'dist/og-card/index.html'];
const stale = /example\.edu\.cn|your-lab|示例大学|Example University|iip-xdu/i;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`${f}  → 不存在`);
    continue;
  }
  const h = fs.readFileSync(f, 'utf8');
  const mails = [...new Set([...h.matchAll(/mailto:([^"'>\s]+)/g)].map((m) => m[1]))];
  const ext = [...new Set([...h.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))];
  console.log(`${f}`);
  console.log(`  mailto : ${mails.join(', ') || '(无)'}`);
  console.log(`  外链   : ${ext.filter((u) => !u.includes('xi-lab-xdu')).join(', ') || '(仅本站)'}`);
  console.log(`  残留占位: ${stale.test(h) ? '⚠ 有：' + (h.match(stale) || [])[0] : '无 ✓'}`);
}

// 全 dist 扫一遍
let bad = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.(html|xml|txt|json)$/.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      if (stale.test(s)) bad.push(`${p} → ${(s.match(stale) || [])[0]}`);
    }
  }
}
walk('dist');
console.log(`\n全 dist 扫描（html/xml/txt/json）：${bad.length === 0 ? '✓ 无占位残留' : '⚠\n' + bad.join('\n')}`);
console.log('dist 根目录:', fs.readdirSync('dist').join('  '));