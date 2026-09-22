import fs from 'node:fs';

/** 核对构建产物里引用的图片都存在，且没有残留旧文件名 */

function check(htmlPath, pattern, label) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const refs = [...html.matchAll(pattern)].map((m) => m[1]);
  console.log(`${label}（${htmlPath}）`);
  if (!refs.length) console.log('  ⚠ 没有找到引用');
  for (const r of refs) {
    const p = `dist${r}`;
    const ok = fs.existsSync(p);
    console.log(`  ${r.padEnd(32)} ${ok ? `存在 ✓  ${(fs.statSync(p).size / 1024).toFixed(1)} KB` : '缺失 ✗'}`);
  }
  console.log('');
  return { html, refs };
}

const research = check('dist/research/index.html', /src="(\/img\/research\/[^"]+)"/g, '研究方向配图');
const home = check('dist/index.html', /src="(\/img\/about-[^"]+)"/g, '首页拼贴配图');

const all = research.html + home.html;
const stale = all.match(/about-1[ab]\.jpg|research\/[a-z0-9-]+\.png/g) ?? [];
console.log(`残留的旧文件名（about-1a/1b、research/*.png）：${stale.length} 处（应为 0）`);

// 顺带确认 SVG 里没有外部依赖（<img> 载入的 SVG 不能加载外部字体/图片）
// 注意：xmlns="http://www.w3.org/2000/svg" 是命名空间声明，不是资源请求，要排除。
console.log('\nSVG 自包含检查（不应有真正的外部资源）：');
for (const f of fs.readdirSync('public/img/research').filter((n) => n.endsWith('.svg'))) {
  const svg = fs.readFileSync(`public/img/research/${f}`, 'utf8');
  const external = [];
  if (/@import/.test(svg)) external.push('@import');
  if (/<image\b/.test(svg)) external.push('<image>');
  for (const m of svg.matchAll(/(?:xlink:href|href)="(https?:\/\/[^"]+)"/g)) external.push(m[1]);
  for (const m of svg.matchAll(/url\((?:"|')?(https?:\/\/[^)"']+)/g)) external.push(m[1]);
  const hasFontFile = /@font-face/.test(svg);
  console.log(
    `  ${f.padEnd(20)} 外部资源 ${external.length} 个  内嵌字体 ${hasFontFile ? '有' : '无'}  ` +
      `${external.length === 0 ? '✓ 自包含' : `✗ ${external.join(', ')}`}`,
  );
}