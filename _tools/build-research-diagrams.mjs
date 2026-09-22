/**
 * 研究方向配图生成：四张自绘矢量网络图
 * ----------------------------------------------------------------------------
 * 为什么要自绘而不是用论文里的框架图：
 *   论文的 framework 图是为具体方法服务的，缩到卡片宽度后小字全糊，
 *   而且跟「这个方向在研究什么」对不上。这里改成按方向内涵画的通用网络图。
 *
 * 为什么用 SVG：
 *   · 矢量，放到任何尺寸都清晰（卡片宽度、点开看大图、Retina 屏）
 *   · 配色能精确使用站点设计令牌，跟主页风格一致
 *   · 可以直接用 CSS 做动画，体积只有几十 KB，且能跟随系统的「减少动态效果」设置
 *
 * 文案一律用英文技术术语（SAR / RGB / 3D …）：站点是中英双语，图里写字就要写两套；
 * 而这些术语在中英文技术语境里写法一致，避免为两种语言各维护一张图。
 *
 * 用法：node _tools/build-research-diagrams.mjs
 * 产物：public/img/research/<方向id>.svg
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'img', 'research');
mkdirSync(OUT, { recursive: true });

/* ─────────────────────────── 设计令牌 ─────────────────────────── */

const C = {
  bg: '#F6FAFE', // 画布底色（比卡片底色略深一点，让图有「图」的边界）
  grid: '#E3EFFA', // 点阵网格
  node: '#FFFFFF',
  nodeStroke: '#C7DFF1',
  accent: '#2E9BD6', // 品牌蓝
  accentDark: '#1F7FB5',
  accentSoft: '#EAF4FC',
  ink: '#0E1F38', // 海军蓝（正文）
  muted: '#55688A',
  line: '#9DC2DD', // 连线
  white: '#FFFFFF',
};

const FONT = "Nunito, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";

const W = 1280;
const H = 800;

/**
 * 全局字号系数。
 *
 * 图是按 1280 宽画的，但在研究方向卡片里只显示到约 580px 宽 —— 缩到 45%。
 * 所以字号要按比例放大，否则卡面上根本读不出来。放大后长标签会超出方框宽度，
 * 因此 box() 里还会按框宽自动收缩（见 fitSize）。
 */
const FS = 1.35;

/* ─────────────────────────── 基础图形 ─────────────────────────── */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * 估算文字宽度并收缩字号，保证不超出给定宽度。
 * 用「字符数 × 字号 × 0.56」粗估拉丁字符的平均宽度 —— 不需要精确，
 * 只要能在排版上留出安全余量即可（中文字符在极少数情况下会偏宽，另有留白兜底）。
 */
function fitSize(str, size, maxWidth) {
  const est = String(str).length * size * 0.56;
  if (est <= maxWidth) return size;
  return Math.max(13, Math.floor((size * maxWidth) / est));
}

/** 圆角矩形，可选居中标题与副标题（字号自动适配框宽） */
function box({
  x, y, w, h,
  label = '', sub = '',
  fill = C.node,
  stroke = C.nodeStroke,
  labelFill = C.ink,
  subFill = C.muted,
  size = 22,
  subSize = 15,
  rx = 12,
  sw = 1.6,
  opacity = 1,
  cls = '',
  /** 标签的垂直位置（相对框顶）。默认居中；框里还要画别的东西时改成靠上 */
  labelOffsetY = null,
}) {
  const parts = [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"${cls ? ` class="${cls}"` : ''}/>`,
  ];
  const cx = x + w / 2;
  const ly = y + (labelOffsetY ?? h / 2);
  const mainSize = fitSize(label, size * FS, w - 22);
  if (sub) {
    const subS = fitSize(sub, subSize * FS, w - 16);
    parts.push(
      `<text x="${cx}" y="${ly - 4}" text-anchor="middle" font-family="${FONT}" font-size="${mainSize}" font-weight="700" fill="${labelFill}">${esc(label)}</text>`,
      `<text x="${cx}" y="${ly + mainSize * 0.82}" text-anchor="middle" font-family="${FONT}" font-size="${subS}" fill="${subFill}">${esc(sub)}</text>`,
    );
  } else if (label) {
    parts.push(
      `<text x="${cx}" y="${ly + mainSize * 0.36}" text-anchor="middle" font-family="${FONT}" font-size="${mainSize}" font-weight="700" fill="${labelFill}">${esc(label)}</text>`,
    );
  }
  return parts.join('');
}

function text(x, y, s, { size = 16, fill = C.muted, anchor = 'middle', weight = 400, maxW = null } = {}) {
  const fs = maxW ? fitSize(s, size * FS, maxW) : size * FS;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${fs}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
}

/** 直线箭头 */
function arrow(x1, y1, x2, y2, { color = C.line, sw = 2.2, dash = '', cls = '' } = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" marker-end="url(#arrow)"${dash ? ` stroke-dasharray="${dash}"` : ''}${cls ? ` class="${cls}"` : ''}/>`;
}

/** 折线箭头（水平走一段再垂直） */
function elbow(x1, y1, x2, y2, { color = C.line, sw = 2.2, cls = '' } = {}) {
  const midX = (x1 + x2) / 2;
  return `<path d="M ${x1} ${y1} H ${midX} V ${y2} H ${x2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" marker-end="url(#arrow)"${cls ? ` class="${cls}"` : ''}/>`;
}

function dot(x, y, r = 3, fill = C.accent) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
}

/* ────────────────────── 共用骨架（背景 / defs / 动画样式） ────────────────────── */

function svgOpen(extraStyle = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.line}"/>
  </marker>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="1.2" fill="${C.grid}"/>
  </pattern>
</defs>
<style>
  /* 系统开了「减少动态效果」就整体静止 —— 不靠 JS，纯 CSS 媒体查询 */
  @media (prefers-reduced-motion: reduce) {
    .flow, .pulse, .fade { animation: none !important; }
    .pulse { opacity: 1 !important; }
  }
  .flow {
    stroke-dasharray: 9 11;
    animation: flowDash 1.6s linear infinite;
  }
  @keyframes flowDash {
    to { stroke-dashoffset: -20; }
  }
${extraStyle}</style>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>`;
}

/* ─────────────────────── ① 多源数据智能分析 ─────────────────────── */

function diagramMultiSource() {
  const inputs = [
    { label: 'RGB / Optical', sub: 'images & video' },
    { label: 'SAR', sub: 'radar backscatter' },
    { label: 'Infrared · Depth', sub: 'thermal & 3D sensors' },
    { label: 'Text', sub: 'language & metadata' },
  ];

  const chipX = 60;
  const chipW = 262;
  const chipH = 92;
  const chipY0 = 96;
  const gap = 44;

  let s = '';

  // 输入分支
  inputs.forEach((it, i) => {
    const y = chipY0 + i * (chipH + gap);
    s += `<g class="pulse" style="animation-delay:${i * 0.5}s">`;
    s += box({ x: chipX, y, w: chipW, h: chipH, label: it.label, sub: it.sub, size: 21, subSize: 14 });
    s += `</g>`;
  });

  // 汇入融合模块的曲线
  const fusion = { x: 452, y: 214, w: 336, h: 372 };
  inputs.forEach((_, i) => {
    const y = chipY0 + i * (chipH + gap) + chipH / 2;
    const ty = fusion.y + 70 + i * 90;
    s += `<path d="M ${chipX + chipW + 14} ${y} C ${chipX + chipW + 96} ${y}, ${fusion.x - 96} ${ty}, ${fusion.x - 12} ${ty}" fill="none" stroke="${C.line}" stroke-width="2.2" marker-end="url(#arrow)"/>`;
  });

  // 融合模块（画成三层堆叠，暗示逐层对齐与融合）
  s += box({ x: fusion.x, y: fusion.y, w: fusion.w, h: fusion.h, fill: C.accentSoft, stroke: C.accent, sw: 2 });
  s += text(fusion.x + fusion.w / 2, fusion.y - 22, 'Cross-modal Fusion', { size: 23, fill: C.ink, weight: 800 });
  ['Alignment', 'Interaction', 'Aggregation'].forEach((name, i) => {
    const by = fusion.y + 52 + i * 92;
    s += box({ x: fusion.x + 34, y: by, w: fusion.w - 68, h: 62, label: name, size: 19, fill: C.white });
    // 层内的小方块，示意 token / 特征（放在层内偏上，别压到边框）
    for (let k = 0; k < 7; k += 1) {
      s += dot(fusion.x + 62 + k * 34, by + 41, 3.4, i === 1 ? C.accent : C.line);
    }
  });

  // 共享表示
  const repX = 900;
  const repY = 214;
  const repW = 320;
  const repH = 150;
  s += arrow(fusion.x + fusion.w + 12, fusion.y + fusion.h / 2, repX - 12, repY + repH / 2);
  s += box({ x: repX, y: repY, w: repW, h: repH, fill: C.accent, stroke: C.accentDark, sw: 2, label: 'Shared Representation', labelFill: C.white, size: 22 });
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      s += `<rect x="${repX + 58 + c * 34}" y="${repY + 84 + r * 18}" width="24" height="12" rx="3" fill="${C.white}" opacity="${0.35 + r * 0.16}"/>`;
    }
  }

  // 下游任务：从共享表示拉一条主干，再分叉到三个并列任务。
  // 注意不能给每个任务各画一条从顶到底的线 —— 那样线会穿过中间的方框，
  // 看起来像「检测→分割→检索」串行，语义就错了。
  const spineX = repX + 34;
  const taskY0 = 430;
  s += `<path d="M ${repX + repW / 2} ${repY + repH + 12} V ${taskY0 - 44} H ${spineX}" fill="none" stroke="${C.line}" stroke-width="2.2"/>`;
  s += `<path d="M ${spineX} ${taskY0 - 44} V ${taskY0 + 2 * 92 + 32}" fill="none" stroke="${C.line}" stroke-width="2.2"/>`;

  const tasks = ['Detection', 'Segmentation', 'Retrieval'];
  tasks.forEach((name, i) => {
    const ty = taskY0 + i * 92;
    s += box({ x: repX + 10, y: ty, w: repW - 20, h: 64, label: name, size: 19 });
    s += `<path d="M ${spineX} ${ty + 32} H ${repX + 10 - 12}" fill="none" stroke="${C.line}" stroke-width="2.2" marker-end="url(#arrow)"/>`;
  });

  return svgOpen(`
  .pulse rect { transition: stroke-width .3s; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { stroke: ${C.nodeStroke}; stroke-width: 1.6; }
    18%, 32% { stroke: ${C.accent}; stroke-width: 3; }
  }`)
    + s
    + `\n</svg>\n`;
}

/* ─────────────────────── ② 四维场景生成理解 ─────────────────────── */

function diagramFourD() {
  let s = '';

  const rowY = 150;
  const rowH = 150;
  const nodes = [
    { x: 70, w: 230, label: 'Multi-view Input', sub: 'images & video' },
    { x: 380, w: 230, label: '2D Encoder', sub: 'multi-scale features' },
    { x: 690, w: 230, label: '3D Generation', sub: 'points · Gaussians' },
    { x: 1000, w: 230, label: '4D Scene', sub: '3D + time' },
  ];

  // 左侧：三张叠放的输入帧
  for (let i = 2; i >= 0; i -= 1) {
    s += `<rect x="${nodes[0].x + 22 + i * 12}" y="${rowY + 22 + i * 12}" width="150" height="106" rx="10" fill="${i === 0 ? C.white : C.accentSoft}" stroke="${i === 0 ? C.accent : C.nodeStroke}" stroke-width="1.6"/>`;
  }
  // 帧内画个抽象的「场景」：地平线 + 一个方块
  s += `<line x1="${nodes[0].x + 30}" y1="${rowY + 84}" x2="${nodes[0].x + 168}" y2="${rowY + 84}" stroke="${C.line}" stroke-width="1.6"/>`;
  s += `<rect x="${nodes[0].x + 92}" y="${rowY + 58}" width="26" height="26" rx="3" fill="${C.accent}" opacity="0.75"/>`;

  // ④ 输出节点里的时间切片
  for (let i = 0; i < 3; i += 1) {
    s += `<rect x="${nodes[3].x + 54 + i * 44}" y="${rowY + 52}" width="34" height="34" rx="6" fill="${C.white}" opacity="0.85"/>`;
  }

  nodes.forEach((n, i) => {
    if (i >= 1) {
      s += box({
        x: n.x, y: rowY, w: n.w, h: rowH,
        label: n.label,
        fill: i === 3 ? C.accent : C.node,
        stroke: i === 3 ? C.accentDark : C.nodeStroke,
        labelFill: i === 3 ? C.white : C.ink,
        size: 21,
        sw: i === 3 ? 2 : 1.6,
      });
      s += text(n.x + n.w / 2, rowY + rowH - 30, n.sub, { size: 14, fill: i === 3 ? C.white : C.muted });
    } else {
      // 第一个节点用图形表达，标签放下面
      s += text(n.x + n.w / 2 + 12, rowY + rowH + 34, n.label, { size: 21, fill: C.ink, weight: 700 });
      s += text(n.x + n.w / 2 + 12, rowY + rowH + 58, n.sub, { size: 14 });
    }
  });

  // 3D 节点：不再往框里塞线框 —— 会和文字叠在一起。
  // 三维的视觉由下方时间轴里三个小线框承担，那里本来就更贴切（逐时刻的三维场景）。

  // 箭头（第一条从叠放帧到 2D Encoder）
  s += arrow(nodes[0].x + 190, rowY + 78, nodes[1].x - 12, rowY + 78);
  for (let i = 1; i < 3; i += 1) {
    s += arrow(nodes[i].x + nodes[i].w + 12, rowY + 78, nodes[i + 1].x - 12, rowY + 78);
  }

  // 下半部分：时间轴，4D 的第四维
  const axisY = 540;
  s += arrow(150, axisY, 1160, axisY, { color: C.muted, sw: 2 });
  s += text(1190, axisY + 8, 't', { size: 20, fill: C.muted, weight: 700 });
  // 标题放轴线下方：放上方会和三个快照框叠在一起
  s += text(660, axisY + 46, 'Time axis — the fourth dimension', { size: 20, fill: C.ink, weight: 700 });

  const stamps = [
    { cx: 300, t: 't₁' },
    { cx: 640, t: 't₂' },
    { cx: 980, t: 't₃' },
  ];
  stamps.forEach((st, i) => {
    const bx = st.cx - 92;
    const by = axisY - 150;
    s += `<g class="pulse" style="animation-delay:${i * 0.7}s">`;
    s += box({ x: bx, y: by, w: 184, h: 118, fill: C.white });
    s += `</g>`;
    // 小线框表示该时刻的三维场景
    const wx = bx + 46;
    const wy = by + 74;
    s += `<g stroke="${C.accent}" stroke-width="1.6" fill="none" opacity="0.85">
      <path d="M ${wx} ${wy} L ${wx + 32} ${wy - 11} L ${wx + 32} ${wy + 21} L ${wx} ${wy + 32} Z"/>
      <path d="M ${wx + 32} ${wy - 11} L ${wx + 56} ${wy - 20} L ${wx + 56} ${wy + 12} L ${wx + 32} ${wy + 21}"/>
      <path d="M ${wx} ${wy} L ${wx + 24} ${wy - 9} L ${wx + 56} ${wy - 20}"/>
      <path d="M ${wx + 24} ${wy - 9} L ${wx + 24} ${wy + 23}"/>
    </g>`;
    s += text(bx + 132, by + 46, st.t, { size: 26, fill: C.accentDark, weight: 800 });
    s += text(bx + 132, by + 72, `snapshot ${i + 1}`, { size: 13 });
    s += arrow(st.cx, by + 130, st.cx, axisY - 14, { color: C.muted, sw: 1.8 });
  });

  // 底部信息带：补上画面下半部的空白，也顺势说清这个方向的几个关键点
  [
    ['Novel View Synthesis', 'render unseen viewpoints'],
    ['Temporal Consistency', 'stable 3D across time'],
    ['Dynamic Scene Editing', 'edit geometry over time'],
  ].forEach(([label, sub], i) => {
    s += box({ x: 70 + i * 390, y: 650, w: 350, h: 76, label, sub, size: 19, subSize: 13 });
  });

  return svgOpen(`
  .pulse rect { animation: pulse4d 2.1s ease-in-out infinite; }
  @keyframes pulse4d {
    0%, 100% { stroke: ${C.nodeStroke}; stroke-width: 1.6; }
    20%, 40% { stroke: ${C.accent}; stroke-width: 3.2; }
  }`)
    + s
    + `\n</svg>\n`;
}

/* ─────────────────────── ③ 具身智能与智能体 ─────────────────────── */

function diagramEmbodied() {
  let s = '';

  const L = 210; // 左侧节点 x
  const R = 830; // 右侧节点 x
  const T = 150; // 上排 y
  const B = 470; // 下排 y
  const NW = 240;
  const NH = 140;

  // 四个节点
  s += box({ x: L, y: T, w: NW, h: NH, label: 'Perception', sub: 'vision · language · state', size: 22 });
  s += box({ x: R, y: T, w: NW, h: NH, label: 'Agent / Planner', sub: 'multimodal reasoning', size: 22, fill: C.accentSoft, stroke: C.accent, sw: 2 });
  s += box({ x: R, y: B, w: NW, h: NH, label: 'Action', sub: 'plan · grasp · navigate', size: 22 });
  s += box({ x: L, y: B, w: NW, h: NH, label: 'Environment', sub: 'objects · people · scenes', size: 22 });

  // 循环连线（顺时针），用流动虚线表示持续交互
  const midY = (T + NH + B) / 2;
  s += `<path class="flow" d="M ${L + NW + 16} ${T + NH / 2} H ${R - 16}" fill="none" stroke="${C.accent}" stroke-width="2.6" marker-end="url(#arrow)"/>`;
  s += `<path class="flow" d="M ${R + NW / 2} ${T + NH + 16} V ${B - 16}" fill="none" stroke="${C.accent}" stroke-width="2.6" marker-end="url(#arrow)"/>`;
  s += `<path class="flow" d="M ${R - 16} ${B + NH / 2} H ${L + NW + 16}" fill="none" stroke="${C.accent}" stroke-width="2.6" marker-end="url(#arrow)"/>`;
  s += `<path class="flow" d="M ${L + NW / 2} ${B - 16} V ${T + NH + 16}" fill="none" stroke="${C.accent}" stroke-width="2.6" marker-end="url(#arrow)"/>`;

  // 四个阶段的小标签
  s += text((L + NW + R) / 2, T + NH / 2 - 14, 'observe', { size: 15, fill: C.accentDark, weight: 700 });
  s += text(R + NW / 2 + 96, midY, 'decide', { size: 15, fill: C.accentDark, weight: 700, anchor: 'start' });
  s += text((L + NW + R) / 2, B + NH / 2 + 26, 'act', { size: 15, fill: C.accentDark, weight: 700 });
  s += text(L + NW / 2 - 96, midY, 'feedback', { size: 15, fill: C.accentDark, weight: 700, anchor: 'end' });

  // 中心：机器人示意 + 闭环说明
  const ccx = (L + NW + R + NW) / 2;
  const ccy = (T + NH + B) / 2 + 18;
  s += `<circle cx="${ccx}" cy="${ccy}" r="86" fill="${C.white}" stroke="${C.nodeStroke}" stroke-width="1.6"/>`;
  // 极简机器人：头 + 身体 + 两条手臂
  s += `<g stroke="${C.accent}" stroke-width="3" fill="none" stroke-linecap="round">
    <rect x="${ccx - 22}" y="${ccy - 46}" width="44" height="34" rx="10" fill="${C.accentSoft}"/>
    <line x1="${ccx}" y1="${ccy - 12}" x2="${ccx}" y2="${ccy + 34}"/>
    <line x1="${ccx - 26}" y1="${ccy - 2}" x2="${ccx + 26}" y2="${ccy - 2}"/>
    <line x1="${ccx - 26}" y1="${ccy - 2}" x2="${ccx - 34}" y2="${ccy + 20}"/>
    <line x1="${ccx + 26}" y1="${ccy - 2}" x2="${ccx + 34}" y2="${ccy + 20}"/>
  </g>`;
  s += dot(ccx - 8, ccy - 30, 3, C.accentDark);
  s += dot(ccx + 8, ccy - 30, 3, C.accentDark);
  s += text(ccx, ccy + 62, 'closed loop', { size: 14, fill: C.muted });

  // 左侧下方补一条「世界模型」的说明块，避免画面偏空
  s += box({ x: 70, y: 690, w: 300, h: 72, label: 'World Model', sub: 'predict the effect of actions', size: 19, subSize: 13 });
  s += box({ x: 420, y: 690, w: 300, h: 72, label: 'Task & Reward', sub: 'goal-conditioned behaviour', size: 19, subSize: 13 });
  s += box({ x: 770, y: 690, w: 300, h: 72, label: 'Sim-to-Real', sub: 'train in simulation, deploy for real', size: 19, subSize: 13 });

  return svgOpen(`
  .flow { animation-duration: 1.2s; }`)
    + s
    + `\n</svg>\n`;
}

/* ─────────────────────── ④ 遥感目标智能感知 ─────────────────────── */

function diagramRemoteSensing() {
  let s = '';

  // 左侧：卫星影像（含检测框）
  const ix = 70;
  const iy = 190;
  const iw = 340;
  const ih = 300;

  s += box({ x: ix, y: iy, w: iw, h: ih, fill: '#E8F2FB', stroke: C.nodeStroke, rx: 10 });
  // 影像里的抽象内容：海面 + 陆地 + 道路
  s += `<rect x="${ix + 8}" y="${iy + 8}" width="${iw - 16}" height="${ih - 16}" rx="6" fill="#DCEBF8"/>`;
  s += `<path d="M ${ix + 8} ${iy + 190} Q ${ix + 110} ${iy + 130}, ${ix + 200} ${iy + 165} T ${ix + iw - 8} ${iy + 120} L ${ix + iw - 8} ${iy + ih - 8} L ${ix + 8} ${iy + ih - 8} Z" fill="#B9D9EE" opacity="0.85"/>`;
  s += `<path d="M ${ix + 40} ${iy + 250} L ${ix + 300} ${iy + 214}" stroke="${C.white}" stroke-width="6" opacity="0.85"/>`;
  s += `<path d="M ${ix + 150} ${iy + 40} L ${ix + 190} ${iy + 250}" stroke="${C.white}" stroke-width="5" opacity="0.7"/>`;

  // 检测框 + 引线标签
  const boxes = [
    { x: ix + 62, y: iy + 196, w: 76, h: 44, t: 'ship' },
    { x: ix + 196, y: iy + 84, w: 66, h: 52, t: 'aircraft' },
    { x: ix + 36, y: iy + 42, w: 70, h: 54, t: 'building' },
  ];
  // 影像上的检测框。动画只让描边依次变亮 —— 不用淡入淡出：
  // 那会让内容在某些时刻整体缺失，随手一瞥就看到空列表，和「内容要清晰」冲突。
  boxes.forEach((b, i) => {
    s += `<rect class="pulse" style="animation-delay:${i * 0.7}s" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="4" fill="none" stroke="${C.accentDark}" stroke-width="3"/>`;
  });
  s += text(ix + iw / 2, iy + ih + 40, 'Satellite / Aerial Image', { size: 21, fill: C.ink, weight: 700, maxW: iw + 60 });
  s += text(ix + iw / 2, iy + ih + 66, 'targets at very different scales', { size: 14, maxW: iw + 60 });

  // 骨干网络：三层结构。中间那层要高一些，好在框内画出多尺度特征的示意条
  const bx = 500;
  const by = 210;
  const rows = [
    { name: 'Backbone', y: by, h: 78 },
    { name: 'Multi-scale Features', y: by + 108, h: 112 },
    { name: 'Detection Head', y: by + 250, h: 78 },
  ];
  rows.forEach((r, i) => {
    s += box({
      x: bx, y: r.y, w: 300, h: r.h,
      label: r.name,
      size: 20,
      fill: i === 2 ? C.accentSoft : C.white,
      stroke: i === 2 ? C.accent : C.nodeStroke,
      sw: i === 2 ? 2 : 1.6,
      // 中间那层框里还要画特征条，标签靠上放
      labelOffsetY: i === 1 ? 36 : null,
    });
    if (i > 0) s += arrow(bx + 150, rows[i - 1].y + rows[i - 1].h + 14, bx + 150, r.y - 12);
  });
  // 多尺度特征：三条由宽到窄的条，示意不同尺度的特征图
  [190, 140, 92].forEach((w, k) => {
    s += `<rect x="${bx + 150 - w / 2}" y="${by + 108 + 62 + k * 16}" width="${w}" height="8" rx="4" fill="${C.accent}" opacity="${0.85 - k * 0.22}"/>`;
  });

  s += arrow(ix + iw + 14, iy + ih / 2, bx - 14, by + 39);

  // 输出：带类别的目标列表
  const ox = 900;
  const oy = 210;
  s += arrow(bx + 314, by + 250 + 39, ox - 14, oy + 150);
  s += box({ x: ox, y: oy, w: 310, h: 300, fill: C.white });
  s += text(ox + 155, oy + 44, 'Detections', { size: 21, fill: C.ink, weight: 800 });
  boxes.forEach((b, i) => {
    const ly = oy + 84 + i * 66;
    // 同样只让方框描边依次高亮，文字始终可见
    s += `<rect class="pulse" style="animation-delay:${i * 0.7}s" x="${ox + 26}" y="${ly - 22}" width="24" height="24" rx="4" fill="none" stroke="${C.accentDark}" stroke-width="2.4"/>`;
    s += text(ox + 64, ly - 4, b.t, { size: 19, fill: C.ink, weight: 700, anchor: 'start' });
    s += text(ox + 64, ly + 22, 'confidence & location', { size: 13, anchor: 'start' });
  });
  s += `<line x1="${ox + 26}" y1="${oy + 272}" x2="${ox + 284}" y2="${oy + 272}" stroke="${C.nodeStroke}" stroke-width="1.6"/>`;
  s += text(ox + 155, oy + 292, 'rotation · scale · occlusion', { size: 14 });

  // 底部信息带：补上下半部的空白，同时点出这个方向的难点
  [
    ['Multi-scale Targets', 'tiny ships to large buildings'],
    ['Orientation & Dense Scenes', 'rotated and crowded objects'],
    ['Cross-domain Transfer', 'optical · SAR · infrared'],
  ].forEach(([label, sub], i) => {
    s += box({ x: 70 + i * 390, y: 650, w: 350, h: 76, label, sub, size: 19, subSize: 13 });
  });

  return svgOpen(`
  /* 检测框依次高亮，示意「正在逐个检出目标」。
     注意是改描边而不是改透明度：内容任何时刻都完整可见。 */
  .pulse { animation: pulseBox 2.4s ease-in-out infinite; }
  @keyframes pulseBox {
    0%, 100% { stroke: ${C.accentDark}; stroke-width: 3; }
    22%, 46% { stroke: ${C.accent}; stroke-width: 5.5; }
  }`)
    + s
    + `\n</svg>\n`;
}

/* ─────────────────────────── 输出 ─────────────────────────── */

const FILES = [
  ['multi-source', diagramMultiSource, '多源数据智能分析'],
  ['4d-scene', diagramFourD, '四维场景生成理解'],
  ['embodied', diagramEmbodied, '具身智能与智能体'],
  ['remote-sensing', diagramRemoteSensing, '遥感目标智能感知'],
];

for (const [id, build, name] of FILES) {
  const svg = build();
  const file = join(OUT, `${id}.svg`);
  writeFileSync(file, svg, 'utf8');
  console.log(`✓ ${id}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB   ${name}`);
}

/* 版权说明：这四张图是自己画的，不涉及第三方素材。
   早先这里放的是从实验室论文里取的 framework 图（MDPI CC BY / arXiv CC BY-NC-SA），
   换成自绘图之后那些授权要求都不再适用 —— 但仍写一份说明，避免以后有人误以为
   这些图来自某篇论文。 */
const credits = `# 研究方向配图说明

研究方向页的四张配图（\`multi-source.svg\` / \`4d-scene.svg\` / \`embodied.svg\` /
\`remote-sensing.svg\`）**是本项目自绘的矢量示意图**，由
[\`_tools/build-research-diagrams.mjs\`](../../_tools/build-research-diagrams.mjs) 生成。

因此：

- 不涉及任何第三方图片版权，不需要署名，也不需要 CC 授权声明；
- 配色取自站点的设计令牌（品牌蓝 \`#2E9BD6\`、海军蓝 \`#0E1F38\`），与页面风格一致；
- 是 SVG 矢量图，点开放大不会糊；
- 其中三张带动画（CSS 关键帧），并遵循系统的「减少动态效果」设置自动静止。

## 为什么不用论文里的 framework 图

早先这四格用的是实验室自己论文里的框架图（3 张 MDPI《Remote Sensing》CC BY 4.0、
1 张 arXiv 版 CC BY-NC-SA 4.0）。换成自绘图的原因：

- 论文插图是为某个具体方法服务的，缩到卡片宽度后小字全糊，读不出内容；
- 那种图讲的是「某一篇论文怎么做」，跟「这个方向在研究什么」不是一回事；
- 自绘图可以说清方向的结构（输入、融合、输出），且不受任何授权限制。

> 旧的论文配图与其授权记录在本仓库的 git 历史里（2026-09 之前的提交），
> 如果将来要回退，从历史中取回即可。

## 重新生成

\`\`\`bash
node _tools/build-research-diagrams.mjs          # 生成四张 SVG 到 public/img/research/
node _tools/_preview-diagrams.mjs                # 可选：拼成一张预览页，便于肉眼检查
\`\`\`

改图只需要改生成脚本里的坐标与文案，不要直接编辑 \`.svg\` —— 它们是生成产物，
下次运行脚本会被覆盖。

本文件由 \`_tools/build-research-diagrams.mjs\` 自动生成。
`;

writeFileSync(join(OUT, 'research-CREDITS.md'), credits, 'utf8');

console.log(`\n共 ${FILES.length} 张，输出到 public/img/research/`);
console.log('版权说明写入 public/img/research/research-CREDITS.md');