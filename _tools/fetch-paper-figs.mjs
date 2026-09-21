/**
 * 下载 MDPI 论文的候选框架图。
 * URL 规律：https://pub.mdpi-res.com/remotesensing/remotesensing-<vol>-<art>/article_deploy/html/images/remotesensing-<vol>-<art>-gNNN.png
 *
 * MDPI 是 CC BY 4.0 开放获取，插图可以合法复用（署名 + 注明许可）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = '_paper-figs';
mkdirSync(OUT, { recursive: true });

const PAPERS = {
  // slug 用的是**文章号**补足 5 位（DOI 里的 rs<卷><期><文章号>，只用文章号）
  remote: 'remotesensing-15-03150',   // rs15123150  Coastal Ship Tracking
  embodied: 'remotesensing-16-04138', // rs16224138  6D Pose Estimation of Space Targets
  fourd: 'remotesensing-16-01772',    // rs16101772  3D Point Cloud Shape Generation
  alt3d: 'remotesensing-15-04163',    // rs15174163  Implicit Neural Representation（备选）
};

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36' };

let ok = 0;
for (const [key, slug] of Object.entries(PAPERS)) {
  for (let n = 1; n <= 3; n++) {
    const num = String(n).padStart(3, '0');
    const url = `https://pub.mdpi-res.com/remotesensing/${slug}/article_deploy/html/images/${slug}-g${num}.png`;
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) {
        console.log(`✗ ${key} g${num}  HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const name = `${key}-g${num}.png`;
      writeFileSync(join(OUT, name), buf);
      ok++;
      console.log(`✓ ${name}  ${(buf.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.log(`✗ ${key} g${num}  ${e.message.slice(0, 60)}`);
    }
  }
}
console.log(`\n共下载 ${ok} 张到 ${OUT}/`);

/* ──────────────────────────────────────────────────────────────
   第 ① 个方向（多源数据智能分析）的框架图来自 arXiv，不在 MDPI 那套 URL 规律里，
   单独取一次：arXiv 的 HTML 版本把插图放在 /html/<id>/ 目录下。
   注意 URL 里的版本号（v1）—— 论文更新版本后文件名可能变，报 404 就来这里改。
   ────────────────────────────────────────────────────────────── */
const ARXIV = [
  {
    // Lightweight RGB-D Salient Object Detection（IEEE TIP 2025）的框架图 Fig. 2
    url: 'https://arxiv.org/html/2505.04758v1/ReLNet.png',
    name: 'multi-source-relnet.png',
  },
];
for (const a of ARXIV) {
  try {
    const res = await fetch(a.url, { headers: UA });
    if (!res.ok) {
      console.log(`✗ arXiv ${a.name}  HTTP ${res.status}（版本号可能变了，改一下 URL）`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(OUT, a.name), buf);
    ok++;
    console.log(`✓ ${a.name}  ${(buf.length / 1024).toFixed(0)} KB  （arXiv）`);
  } catch (e) {
    console.log(`✗ arXiv ${a.name}  ${e.message.slice(0, 70)}`);
  }
}

console.log(`\n总计 ${ok} 张。下一步：python _tools/build-research-figures.py`);