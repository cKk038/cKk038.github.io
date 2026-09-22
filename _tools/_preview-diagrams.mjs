/**
 * 把生成的 SVG 内联成一个预览页，用无头 Chrome 截图来做视觉检查。
 *
 * 为什么要内联：SVG 用 <img> 引入时无法从外部改样式，而检查布局时
 * 需要临时关掉动画、把淡入元素强制显示出来（否则截到的是初始帧，元素全透明）。
 *
 * 用法：node _tools/_preview-diagrams.mjs
 * 产物：_candidates/diagrams-preview.html（再用 Chrome 截图）
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public', 'img', 'research');
const OUT = join(ROOT, '_candidates', 'diagrams-preview.html');
mkdirSync(join(ROOT, '_candidates'), { recursive: true });

const ITEMS = [
  ['multi-source', '① 多源数据智能分析'],
  ['4d-scene', '② 四维场景生成理解'],
  ['embodied', '③ 具身智能与智能体'],
  ['remote-sensing', '④ 遥感目标智能感知'],
];

const cells = ITEMS.map(([id, title]) => {
  let svg = readFileSync(join(SRC, `${id}.svg`), 'utf8');
  // 去掉 XML 声明与外层固定宽高，让它自适应格子宽度
  svg = svg.replace(/<\?xml[^>]*\?>\s*/, '').replace(/(<svg[^>]*?)\swidth="\d+"\sheight="\d+"/, '$1');
  return `<figure>
    <figcaption>${title}　<span>${id}.svg</span></figcaption>
    <div class="canvas">${svg}</div>
  </figure>`;
}).join('\n');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>研究方向配图预览</title>
<style>
  body { margin: 0; padding: 18px; background: #eef3f8;
         font-family: "Segoe UI", system-ui, sans-serif; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  figure { margin: 0; background: #fff; border-radius: 10px; overflow: hidden;
           box-shadow: 0 2px 10px rgba(14,31,56,.10); }
  figcaption { padding: 8px 12px; font-size: 15px; font-weight: 700; color: #0E1F38;
               border-bottom: 1px solid #e3eefa; }
  figcaption span { font-weight: 400; color: #55688A; font-size: 13px; }
  .canvas svg { display: block; width: 100%; height: auto; }
  /* 检查时把动画停掉、淡入元素全部显示出来，一帧看全 */
  .canvas * { animation: none !important; }
  .canvas .fade, .canvas .pulse { opacity: 1 !important; }
</style></head>
<body><div class="grid">
${cells}
</div></body></html>`;

writeFileSync(OUT, html, 'utf8');
console.log(`预览页：${OUT}`);
console.log('截图：chrome --headless=new --screenshot=... --window-size=1440,1180 file:///...');