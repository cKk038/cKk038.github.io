import fs from 'node:fs';

const pairs = [
  ['src/config/site.ts', 'dist/index.html'],
  ['src/data/people.ts', 'dist/team/index.html'],
  ['src/data/research.ts', 'dist/research/index.html'],
];

console.log('=== 源文件 vs 构建产物的修改时间 ===\n');
for (const [src, out] of pairs) {
  if (!fs.existsSync(src) || !fs.existsSync(out)) {
    console.log(`${src} 或 ${out} 不存在`);
    continue;
  }
  const a = fs.statSync(src).mtime;
  const b = fs.statSync(out).mtime;
  console.log(src.padEnd(26), a.toLocaleString('zh-CN'));
  console.log(out.padEnd(26), b.toLocaleString('zh-CN'));
  console.log(`  → 构建产物${b > a ? '比源文件新 ✓' : '比源文件旧 ⚠ 需要重新构建'}\n`);
}

// 顺便看一下 dist 里是否已包含源文件里的最新文案。
// 中英文页面用各自的语言，所以按路径分别用中/英标记来查，否则英文页会误报。
console.log('=== 构建产物里有没有最新的研究方向文案 ===');
const zhMarker = '四维场景生成理解';
const enMarker = '4D scene generation and understanding';
for (const f of [
  'dist/index.html',
  'dist/team/index.html',
  'dist/research/index.html',
  'dist/en/index.html',
  'dist/en/team/index.html',
  'dist/en/research/index.html',
]) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const marker = f.includes('/en/')
    ? /4D scene generation and understanding/i
    : /四维场景生成理解/;
  console.log(`  ${f.padEnd(28)} ${marker.test(s) ? '✓ 含最新方向' : '· 该页不涉及方向文案'}`);
}