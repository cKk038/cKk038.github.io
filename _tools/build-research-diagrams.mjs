/**
 * 研究方向配图生成：四张自绘矢量网络图（论文插图风格）
 * ----------------------------------------------------------------------------
 * 设计目标：不是「方框 + 箭头」的流程示意，而是**顶级论文里那种插图** ——
 * 让人一眼看出这个方向在解决什么问题、输入输出长什么样、难点在哪里。
 * 做法是往图里塞**具体的缩略图内容**（任务示例、结果、对比、难点标注），
 * 而不是只画方框：形状和颜色在卡片尺寸下读得出来，文字读不出来。
 *
 * 为什么用 SVG：矢量，点开放大不糊；配色精确用站点的设计令牌；体积只有几十 KB；
 * 动画用 CSS 关键帧，且遵循系统的「减少动态效果」设置自动静止。
 *
 * 文案一律用英文技术术语（SAR / RGB / 3D / 6D pose …）：站点是中英双语，
 * 图里写字就要写两套，而这些术语在中英文技术语境里写法一致。
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
  bg: '#F6FAFE',
  grid: '#E3EFFA',
  node: '#FFFFFF',
  nodeStroke: '#C7DFF1',
  accent: '#2E9BD6', // 品牌蓝：方法/结构
  accentDark: '#1F7FB5',
  accentSoft: '#EAF4FC',
  warn: '#D9822B', // 暖橙：目标 / 结果 / 高亮（与站点里 [[人名]] 的高亮同色系）
  warnSoft: '#FDF1E3',
  ok: '#2F9E6B', // 绿：正确 / 命中（对比面板用）
  ink: '#0E1F38',
  muted: '#55688A',
  line: '#9DC2DD',
  white: '#FFFFFF',
};

const FONT = "Nunito, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";

const W = 1280;
const H = 800;

/** 全局字号系数：图按 1280 宽画，卡片里只显示到约 580px，字号要按比例放大 */
const FS = 1.3;

/* ─────────────────────── 确定性随机（保证可复现） ─────────────────────── */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let uid = 0;
const nextId = (p) => `${p}${(uid += 1)}`;

/* ─────────────────────────── 基础图形 ─────────────────────────── */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 估算文字宽度并收缩字号，保证不超出给定宽度 */
function fitSize(str, size, maxWidth) {
  const est = String(str).length * size * 0.56;
  if (est <= maxWidth) return size;
  return Math.max(13, Math.floor((size * maxWidth) / est));
}

/** 圆角矩形 + 可选居中标题/副标题（字号自动适配框宽） */
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

function text(x, y, s, { size = 16, fill = C.muted, anchor = 'middle', weight = 400, maxW = null, cls = '' } = {}) {
  const fs = maxW ? fitSize(s, size * FS, maxW) : size * FS;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${fs}" font-weight="${weight}" fill="${fill}"${cls ? ` class="${cls}"` : ''}>${esc(s)}</text>`;
}

/** 带底衬的标题文字。
 *  汇入的连线常常会穿过标题那一行，给文字加一块底色，线从后面过也不影响阅读。 */
function labelChip(cx, y, s, { size = 19, fill = C.ink, bg = C.bg, pad = 12 } = {}) {
  const fs = size * FS;
  const w = String(s).length * fs * 0.56 + pad * 2;
  const h = fs * 1.55;
  return (
    `<rect x="${(cx - w / 2).toFixed(1)}" y="${(y - fs * 1.1).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(h / 2).toFixed(1)}" fill="${bg}"/>` +
    text(cx, y, s, { size, fill, weight: 700 })
  );
}

/** 直线/折线箭头 */
function arrow(x1, y1, x2, y2, { color = C.line, sw = 2.2, cls = '', marker = 'arrow' } = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" marker-end="url(#${marker})"${cls ? ` class="${cls}"` : ''}/>`;
}

function curve(d, { color = C.line, sw = 2.2, cls = '', marker = 'arrow', dash = '' } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} marker-end="url(#${marker})"${cls ? ` class="${cls}"` : ''}/>`;
}

function dot(x, y, r = 3, fill = C.accent) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
}

/** 虚线标注框 + 标注文字（论文图里标「难点」的常见做法） */
function callout(x, y, w, h, label, { color = C.warn, side = 'top', rx = 8, size = 12 } = {}) {
  const box_ = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="7 5"/>`;
  const tw = String(label).length * size * FS * 0.58 + 16;
  const ty = side === 'top' ? y - 10 : y + h + size * FS + 6;
  const tag = `<rect x="${x}" y="${ty - size * FS}" width="${tw}" height="${size * FS + 8}" rx="6" fill="${color}" opacity="0.14"/>`;
  const txt = `<text x="${x + tw / 2}" y="${ty + 1}" text-anchor="middle" font-family="${FONT}" font-size="${size * FS}" font-weight="700" fill="${color}">${esc(label)}</text>`;
  return box_ + tag + txt;
}

/** 旋转矩形（遥感里的有向框 OBB） */
function orientedRect(cx, cy, w, h, deg, { stroke = C.warn, sw = 2.8, fill = 'none', dash = '' } = {}) {
  const a = (deg * Math.PI) / 180;
  const dx = (Math.cos(a) * w) / 2;
  const dy = (Math.sin(a) * w) / 2;
  const px = (-Math.sin(a) * h) / 2;
  const py = (Math.cos(a) * h) / 2;
  const pts = [
    [cx - dx - px, cy - dy - py],
    [cx + dx - px, cy + dy - py],
    [cx + dx + px, cy + dy + py],
    [cx - dx + px, cy - dy + py],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

/** 轴对齐矩形（对比面板里用） */
function axisRect(cx, cy, w, h, { stroke = C.muted, sw = 2.4, fill = 'none', dash = '' } = {}) {
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

function checkMark(x, y, { color = C.ok, s = 1 } = {}) {
  return `<path d="M ${x - 10 * s} ${y} l ${7 * s} ${8 * s} l ${13 * s} ${-16 * s}" fill="none" stroke="${color}" stroke-width="${3.4 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function crossMark(x, y, { color = '#C9503F', s = 1 } = {}) {
  return `<path d="M ${x - 8 * s} ${y - 8 * s} l ${16 * s} ${16 * s} M ${x + 8 * s} ${y - 8 * s} l ${-16 * s} ${16 * s}" fill="none" stroke="${color}" stroke-width="${3.4 * s}" stroke-linecap="round"/>`;
}

/** 小相机图标（表示视角 / 观测） */
function cameraIcon(x, y, s = 1, color = C.accentDark) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-15" y="-10" width="30" height="20" rx="4" fill="none" stroke="${color}" stroke-width="2.4"/>
    <circle cx="0" cy="0" r="6" fill="none" stroke="${color}" stroke-width="2.4"/>
    <path d="M -15 -4 l -6 -4 v 16 l 6 -4" fill="${color}"/>
  </g>`;
}

/** 6D 位姿坐标轴（位姿估计论文里的标志性画法） */
function poseAxes(cx, cy, s = 1) {
  const L = 34 * s;
  return `<g stroke-linecap="round" stroke-width="3">
    <line x1="${cx}" y1="${cy}" x2="${cx + L * 0.92}" y2="${cy + L * 0.22}" stroke="#D9503F"/>
    <line x1="${cx}" y1="${cy}" x2="${cx - L * 0.34}" y2="${cy + L * 0.86}" stroke="#3F9D5C"/>
    <line x1="${cx}" y1="${cy}" x2="${cx - L * 0.5}" y2="${cy - L * 0.86}" stroke="#3A78C9"/>
  </g>`;
}

/* ───────────────────── 缩略影像（论文插图的核心） ─────────────────────
 * 卡片尺寸下文字读不出来，形状和颜色读得出来。所以这些「小图」承担主要信息量。
 */

function miniScene(x, y, w, h, kind, { rx = 8, seed = 7 } = {}) {
  const id = nextId('clip');
  const clipDef = `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath></defs>`;
  let art = '';

  if (kind === 'day') {
    // 可见光：天空 + 太阳 + 水面 + 船
    art = `
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.54}" fill="#C3E4F6"/>
      <circle cx="${x + w * 0.8}" cy="${y + h * 0.2}" r="${h * 0.1}" fill="#FFF0BE"/>
      <rect x="${x}" y="${y + h * 0.54}" width="${w}" height="${h * 0.46}" fill="#2C6C8C"/>
      <path d="M ${x + w * 0.24} ${y + h * 0.68} h ${w * 0.4} l ${w * 0.09} ${h * 0.12} h ${-w * 0.58} z" fill="#F4F8FB"/>
      <path d="M ${x + w * 0.4} ${y + h * 0.68} v ${-h * 0.12} h ${w * 0.11} v ${h * 0.12} z" fill="#E3EBF2"/>
      <path d="M ${x + w * 0.16} ${y + h * 0.88} h ${w * 0.68}" stroke="#8FC0DA" stroke-width="2" opacity="0.7"/>`;
  } else if (kind === 'ir') {
    // 红外：暗底 + 热源亮斑 + 目标剪影
    const g = nextId('g');
    art = `
      <defs><radialGradient id="${g}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFF3C0" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#E8763A" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#2A1B44" stop-opacity="0"/>
      </radialGradient></defs>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#241A3C"/>
      <ellipse cx="${x + w * 0.46}" cy="${y + h * 0.66}" rx="${w * 0.26}" ry="${h * 0.24}" fill="url(#${g})"/>
      <path d="M ${x + w * 0.26} ${y + h * 0.7} h ${w * 0.4} l ${w * 0.09} ${h * 0.1} h ${-w * 0.58} z" fill="#0D0A18"/>
      <path d="M ${x + w * 0.42} ${y + h * 0.7} v ${-h * 0.1} h ${w * 0.1} v ${h * 0.1} z" fill="#0D0A18"/>`;
  } else if (kind === 'depth') {
    // 深度：近处亮、远处暗 + 目标剪影
    const g = nextId('g');
    art = `
      <defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#F2F6FA"/><stop offset="100%" stop-color="#4A6E8C"/>
      </linearGradient></defs>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/>
      <path d="M ${x + w * 0.26} ${y + h * 0.62} h ${w * 0.4} l ${w * 0.09} ${h * 0.11} h ${-w * 0.58} z" fill="#1E3A52"/>
      <path d="M ${x + w * 0.42} ${y + h * 0.62} v ${-h * 0.11} h ${w * 0.1} v ${h * 0.11} z" fill="#1E3A52"/>`;
  } else if (kind === 'sar') {
    // SAR：斑点噪声 + 强散射亮斑
    const r = rng(seed);
    let speck = '';
    for (let i = 0; i < 150; i += 1) {
      const px = x + 2 + r() * (w - 4);
      const py = y + 2 + r() * (h - 4);
      const v = r();
      speck += `<rect x="${px.toFixed(0)}" y="${py.toFixed(0)}" width="2.4" height="2.4" fill="${v > 0.72 ? '#EAF3FA' : v > 0.42 ? '#8E9DB2' : '#59677D'}" opacity="${(0.35 + v * 0.5).toFixed(2)}"/>`;
    }
    art = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4C5A70"/>
      ${speck}
      <path d="M ${x + w * 0.24} ${y + h * 0.66} h ${w * 0.42} l ${w * 0.09} ${h * 0.11} h ${-w * 0.6} z" fill="#FFFFFF" opacity="0.92"/>
      <circle cx="${x + w * 0.3}" cy="${y + h * 0.72}" r="${h * 0.035}" fill="#FFFFFF"/>
      <circle cx="${x + w * 0.38}" cy="${y + h * 0.7}" r="${h * 0.03}" fill="#FFFFFF"/>
      <circle cx="${x + w * 0.62}" cy="${y + h * 0.73}" r="${h * 0.04}" fill="#FFFFFF"/>`;
  } else if (kind === 'text') {
    // 文本：几行字 + 一个高亮词
    art = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFFFF"/>
      <rect x="${x + 10}" y="${y + 10}" width="${w * 0.62}" height="7" rx="3.5" fill="#C7D6E4"/>
      <rect x="${x + 10}" y="${y + 26}" width="${w * 0.78}" height="7" rx="3.5" fill="#D6E2EC"/>
      <rect x="${x + 10}" y="${y + 42}" width="${w * 0.34}" height="7" rx="3.5" fill="${C.warn}" opacity="0.55"/>
      <rect x="${x + 10 + w * 0.36}" y="${y + 42}" width="${w * 0.4}" height="7" rx="3.5" fill="#D6E2EC"/>
      <rect x="${x + 10}" y="${y + 58}" width="${w * 0.52}" height="7" rx="3.5" fill="#D6E2EC"/>`;
  } else if (kind === 'sat') {
    // 卫星影像：陆地 + 水 + 若干小目标
    art = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2C6C8C"/>
      <path d="M ${x} ${y + h * 0.42} Q ${x + w * 0.3} ${y + h * 0.2}, ${x + w * 0.58} ${y + h * 0.34} T ${x + w} ${y + h * 0.26} L ${x + w} ${y} L ${x} ${y} Z" fill="#5D7A52"/>
      <path d="M ${x} ${y + h * 0.82} Q ${x + w * 0.4} ${y + h * 0.6}, ${x + w * 0.72} ${y + h * 0.78} T ${x + w} ${y + h * 0.62} L ${x + w} ${y + h} L ${x} ${y + h} Z" fill="#4E6B47"/>
      <path d="M ${x + w * 0.16} ${y + h * 0.62} Q ${x + w * 0.44} ${y + h * 0.5}, ${x + w * 0.68} ${y + h * 0.6}" fill="none" stroke="#1F5674" stroke-width="4" opacity="0.8"/>`;
  } else if (kind === 'night') {
    const r = rng(seed + 3);
    let lights = '';
    for (let i = 0; i < 90; i += 1) {
      const px = x + 6 + r() * (w - 12);
      const py = y + h * 0.34 + r() * (h * 0.6);
      lights += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(1 + r() * 1.8).toFixed(1)}" fill="#FFD98A" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
    }
    art = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#101C2E"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.34}" fill="#0B1421"/>
      ${lights}`;
  }

  return `${clipDef}<g clip-path="url(#${id})">${art}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${C.nodeStroke}" stroke-width="1.4"/>`;
}

/** 点云：散点聚成一个形状（论文里的点云示意图） */
function pointCloud(cx, cy, s = 1, kind = 'car', color = C.accent) {
  const r = rng(kind === 'car' ? 11 : 23);
  const pts = [];
  const n = 90;
  for (let i = 0; i < n; i += 1) {
    let px = 0;
    let py = 0;
    let pz = 0;
    if (kind === 'car') {
      // 车身近似长方体 + 车顶
      const body = r() > 0.35;
      px = (r() - 0.5) * 84;
      py = body ? (r() - 0.5) * 20 + 6 : (r() - 0.5) * 16 - 16;
      pz = body ? (r() - 0.5) * 40 : (r() - 0.5) * 26;
    } else {
      // 椅子：座面 + 靠背
      const seat = r() > 0.5;
      px = (r() - 0.5) * 54;
      py = seat ? 10 : -18;
      pz = seat ? (r() - 0.5) * 48 : -22;
    }
    // 等距投影
    const sx = cx + (px + pz * 0.55) * s;
    const sy = cy + (py + pz * 0.3 - px * 0.06) * s;
    pts.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(1.5 * s).toFixed(2)}" fill="${color}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`);
  }
  return pts.join('');
}

/** 高斯软斑：一组半透明椭圆，示意 Gaussian splatting 的表示 */
function gaussians(cx, cy, s = 1) {
  const r = rng(41);
  const blobs = [];
  const colors = ['#7FC3E8', '#B9DDF3', '#F2C58A', '#9AD3B4'];
  for (let i = 0; i < 10; i += 1) {
    const px = cx + (r() - 0.5) * 150 * s;
    const py = cy + (r() - 0.5) * 90 * s;
    const rx = (14 + r() * 26) * s;
    const ry = rx * (0.4 + r() * 0.4);
    blobs.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${colors[i % colors.length]}" opacity="0.34"/>`,
    );
  }
  return blobs.join('');
}

/** 三维线框立方体（等距投影） */
function wireBox(cx, cy, w, h, d, { color = C.accent, sw = 2, fill = 'none', opacity = 1, dash = '' } = {}) {
  const ox = d * 0.55;
  const oy = -d * 0.4;
  const pts = (dx, dy) => `${(cx + dx).toFixed(1)},${(cy + dy).toFixed(1)}`;
  const front = [pts(-w / 2, -h / 2), pts(w / 2, -h / 2), pts(w / 2, h / 2), pts(-w / 2, h / 2)].join(' ');
  const back = [pts(-w / 2 + ox, -h / 2 + oy), pts(w / 2 + ox, -h / 2 + oy), pts(w / 2 + ox, h / 2 + oy), pts(-w / 2 + ox, h / 2 + oy)].join(' ');
  return `<g opacity="${opacity}">
    <polygon points="${back}" fill="${fill}" stroke="${color}" stroke-width="${sw}" opacity="0.55"${dash ? ` stroke-dasharray="${dash}"` : ''}/>
    <polygon points="${front}" fill="${fill}" stroke="${color}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>
    <line x1="${cx - w / 2}" y1="${cy - h / 2}" x2="${cx - w / 2 + ox}" y2="${cy - h / 2 + oy}" stroke="${color}" stroke-width="${sw}"/>
    <line x1="${cx + w / 2}" y1="${cy - h / 2}" x2="${cx + w / 2 + ox}" y2="${cy - h / 2 + oy}" stroke="${color}" stroke-width="${sw}"/>
    <line x1="${cx + w / 2}" y1="${cy + h / 2}" x2="${cx + w / 2 + ox}" y2="${cy + h / 2 + oy}" stroke="${color}" stroke-width="${sw}"/>
    <line x1="${cx - w / 2}" y1="${cy + h / 2}" x2="${cx - w / 2 + ox}" y2="${cy + h / 2 + oy}" stroke="${color}" stroke-width="${sw}"/>
  </g>`;
}

/** 机械臂（两节 + 夹爪） */
function robotArm(x, y, s = 1, { bend = -34, open = 1, color = C.accentDark } = {}) {
  // 底座 → 上臂 → 前臂 → 夹爪，角度可调，用来画动作回放
  const a1 = (-90 + bend * 0.35) * (Math.PI / 180);
  const L1 = 96 * s;
  const E = [x + Math.cos(a1) * L1, y + Math.sin(a1) * L1];
  const a2 = (-90 + bend * 1.5) * (Math.PI / 180);
  const L2 = 84 * s;
  const T = [E[0] + Math.cos(a2) * L2, E[1] + Math.sin(a2) * L2];
  const grip = 18 * s * open;
  return `<g stroke="${color}" stroke-width="${6 * s}" stroke-linecap="round" fill="none">
    <line x1="${x}" y1="${y}" x2="${E[0].toFixed(1)}" y2="${E[1].toFixed(1)}"/>
    <line x1="${E[0].toFixed(1)}" y1="${E[1].toFixed(1)}" x2="${T[0].toFixed(1)}" y2="${T[1].toFixed(1)}"/>
    <line x1="${T[0].toFixed(1)}" y1="${T[1].toFixed(1)}" x2="${(T[0] - grip).toFixed(1)}" y2="${(T[1] - 12 * s).toFixed(1)}"/>
    <line x1="${T[0].toFixed(1)}" y1="${T[1].toFixed(1)}" x2="${(T[0] + grip).toFixed(1)}" y2="${(T[1] - 12 * s).toFixed(1)}"/>
  </g>
  <rect x="${x - 20 * s}" y="${y - 6 * s}" width="${40 * s}" height="${14 * s}" rx="4" fill="${color}"/>
  <circle cx="${x}" cy="${y}" r="${7 * s}" fill="${C.ink}" opacity="0.75"/>
  <circle cx="${E[0].toFixed(1)}" cy="${E[1].toFixed(1)}" r="${5 * s}" fill="${C.ink}" opacity="0.6"/>`;
}

/* ────────────────────── 共用骨架（背景 / 标记 / 动画） ────────────────────── */

function svgOpen(extraStyle = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.line}"/>
  </marker>
  <marker id="arrowFlow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.accent}"/>
  </marker>
  <marker id="arrowWarn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.warn}"/>
  </marker>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="1.2" fill="${C.grid}"/>
  </pattern>
</defs>
<style>
  /* 系统开了「减少动态效果」就整体静止 —— 不靠 JS，纯 CSS 媒体查询。
     注意所有动画都只改描边/颜色，不改透明度：内容任何时刻都必须完整可见。 */
  @media (prefers-reduced-motion: reduce) {
    .flow, .pulse, .blink { animation: none !important; }
  }
  .flow { stroke-dasharray: 9 11; animation: flowDash 1.6s linear infinite; }
  @keyframes flowDash { to { stroke-dashoffset: -20; } }
  .pulse rect, .pulse polygon { animation: pulseStroke 2.4s ease-in-out infinite; }
  @keyframes pulseStroke {
    0%, 100% { stroke-width: 2.6; }
    22%, 46% { stroke-width: 5.5; }
  }
  .blink { animation: blinkFill 2.4s ease-in-out infinite; }
  @keyframes blinkFill {
    0%, 100% { fill: ${C.accentSoft}; }
    24%, 46% { fill: ${C.warnSoft}; }
  }
${extraStyle}</style>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>`;
}

/* ═══════════════════ ① 多源数据智能分析 ═══════════════════ */

function diagramMultiSource() {
  let s = '';

  // —— 顶部：同一场景的五种模态 ——
  s += text(640, 46, 'One scene, captured by complementary modalities', {
    size: 20,
    fill: C.ink,
    weight: 700,
  });

  const mods = [
    { kind: 'day', label: 'RGB / Optical', sub: 'appearance & texture' },
    { kind: 'ir', label: 'Infrared', sub: 'targets in the dark' },
    { kind: 'depth', label: 'Depth', sub: 'geometry' },
    { kind: 'sar', label: 'SAR', sub: 'all-weather radar' },
    { kind: 'text', label: 'Text', sub: 'semantics' },
  ];
  const tileW = 212;
  const tileH = 118;
  const gap = 20;
  const rowW = mods.length * tileW + (mods.length - 1) * gap;
  const x0 = (W - rowW) / 2;
  const tileY = 64;

  mods.forEach((m, i) => {
    const x = x0 + i * (tileW + gap);
    s += miniScene(x, tileY, tileW, tileH, m.kind, { seed: 7 + i * 13 });
    s += text(x + tileW / 2, tileY + tileH + 26, m.label, { size: 17, fill: C.ink, weight: 700, maxW: tileW });
    s += text(x + tileW / 2, tileY + tileH + 48, m.sub, { size: 12, maxW: tileW });
  });

  // 模态互补的标注：圈出红外里那个「可见光看不见」的目标。
  // 标签直接写在红外小图内部（那张图是深色底，橙字读得清），
  // 不用 callout 的文字气泡 —— 气泡会压到下面的模态标签。
  const irX = x0 + (tileW + gap);
  s += `<rect x="${irX + 52}" y="${tileY + 54}" width="96" height="56" rx="8" fill="none" stroke="${C.warn}" stroke-width="2" stroke-dasharray="7 5"/>`;
  s += text(irX + tileW / 2, tileY + tileH - 10, 'invisible in RGB', { size: 11, fill: C.warn, weight: 700, maxW: tileW - 20 });

  // —— 汇入融合模块 ——
  s += labelChip(640, 264, 'Cross-modal alignment & fusion', { size: 19 });
  const fuse = { x: 300, y: 286, w: 680, h: 168 };
  s += box({ x: fuse.x, y: fuse.y, w: fuse.w, h: fuse.h, fill: C.accentSoft, stroke: C.accent, sw: 2 });

  // 五路输入汇入（从模态标签下方起画，避免穿过标签）
  mods.forEach((_, i) => {
    const x = x0 + i * (tileW + gap) + tileW / 2;
    s += curve(
      `M ${x} ${tileY + tileH + 58} C ${x} ${fuse.y - 26}, ${fuse.x + 70 + i * 40} ${fuse.y - 20}, ${fuse.x + 70 + i * 40} ${fuse.y + 20}`,
      { color: C.line, sw: 2 },
    );
  });

  // 注意力热图（论文里表示跨模态交互的标准画法）
  const hmX = fuse.x + 44;
  const hmY = fuse.y + 42;
  const cell = 17;
  const r = rng(5);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const v = row === col ? 0.55 + r() * 0.45 : r() * 0.42;
      s += `<rect x="${hmX + col * cell}" y="${hmY + row * cell}" width="${cell - 2}" height="${cell - 2}" rx="2" fill="${C.warn}" opacity="${v.toFixed(2)}"/>`;
    }
  }
  s += text(hmX + (5 * cell) / 2 - 1, hmY + 5 * cell + 20, 'attention', { size: 12, maxW: 110 });

  // 跨模态交互的循环箭头
  s += curve(`M ${hmX + 5 * cell + 20} ${hmY + 20} C ${hmX + 5 * cell + 86} ${hmY - 14}, ${hmX + 5 * cell + 86} ${hmY + 74}, ${hmX + 5 * cell + 20} ${hmY + 62}`, {
    color: C.accent,
    sw: 2.2,
    marker: 'arrowFlow',
  });
  s += text(hmX + 5 * cell + 62, hmY + 34, 'align', { size: 12, fill: C.accentDark, weight: 700, maxW: 90 });

  // 融合后的共享表示：一排 token
  const tkX = fuse.x + 430;
  const tkY = fuse.y + 52;
  s += box({ x: tkX - 16, y: tkY - 22, w: 244, h: 96, rx: 10, fill: C.white });
  for (let i = 0; i < 8; i += 1) {
    s += `<rect x="${tkX + i * 26}" y="${tkY}" width="18" height="46" rx="4" fill="${C.accent}" opacity="${(0.35 + (i % 4) * 0.18).toFixed(2)}"/>`;
  }
  s += text(tkX + 96, tkY + 82, 'shared representation', { size: 12, maxW: 220 });
  s += curve(`M ${hmX + 5 * cell + 96} ${hmY + 40} H ${tkX - 24}`, { color: C.line, sw: 2 });

  // —— 下游任务与结果示例 ——
  const tasks = [
    { label: 'Detection', sub: 'fuse → find the ship', kind: 'result-det' },
    { label: 'Segmentation', sub: 'fuse → land-cover mask', kind: 'result-seg' },
    { label: 'Retrieval / Re-ID', sub: 'match across modalities', kind: 'result-reid' },
  ];
  const cardW = 372;
  const cardH = 186;
  const cardGap = 42;
  const cardW0 = (W - (cardW * 3 + cardGap * 2)) / 2;
  const cardY = 552;

  tasks.forEach((t, i) => {
    const x = cardW0 + i * (cardW + cardGap);
    s += box({ x, y: cardY, w: cardW, h: cardH, label: t.label, size: 19, labelOffsetY: 34 });
    s += text(x + cardW / 2, cardY + 58, t.sub, { size: 12, maxW: cardW - 24 });

    const ax = x + 30;
    const ay = cardY + 78;
    const aw = cardW - 60;
    const ah = 86;

    if (t.kind === 'result-det') {
      s += miniScene(ax, ay, aw, ah, 'sat', { seed: 3 });
      s += orientedRect(ax + aw * 0.34, ay + ah * 0.68, 44, 20, -18);
      s += orientedRect(ax + aw * 0.62, ay + ah * 0.56, 34, 16, 12);
    } else if (t.kind === 'result-seg') {
      s += miniScene(ax, ay, aw, ah, 'sat', { seed: 9 });
      s += `<path d="M ${ax} ${ay + ah * 0.5} Q ${ax + aw * 0.3} ${ay + ah * 0.26}, ${ax + aw * 0.56} ${ay + ah * 0.42} T ${ax + aw} ${ay + ah * 0.3} L ${ax + aw} ${ay} L ${ax} ${ay} Z" fill="${C.ok}" opacity="0.42"/>`;
      s += `<path d="M ${ax} ${ay + ah * 0.86} Q ${ax + aw * 0.4} ${ay + ah * 0.62}, ${ax + aw * 0.74} ${ay + ah * 0.8} T ${ax + aw} ${ay + ah * 0.66} L ${ax + aw} ${ay + ah} L ${ax} ${ay + ah} Z" fill="${C.warn}" opacity="0.38"/>`;
    } else {
      s += miniScene(ax, ay, aw * 0.4, ah, 'day', { seed: 4 });
      s += miniScene(ax + aw * 0.6, ay, aw * 0.4, ah, 'ir', { seed: 5 });
      s += curve(`M ${ax + aw * 0.44} ${ay + ah * 0.5} H ${ax + aw * 0.56}`, { color: C.ok, sw: 2.6 });
      s += checkMark(ax + aw * 0.5, ay + ah + 2, { s: 0.8 });
    }
  });

  // 共享表示 → 三个任务：走一条主干再分叉，别画三条互相穿插的曲线
  const pillY = 468;
  s += box({ x: 470, y: pillY, w: 340, h: 46, rx: 23, fill: C.accent, stroke: C.accentDark, sw: 2, label: 'Joint interpretation', labelFill: C.white, size: 16 });
  s += curve(`M ${tkX + 96} ${tkY + 100} V ${pillY - 10}`, { color: C.line, sw: 2 });

  const spineY = pillY + 58;
  const cardXs = tasks.map((_, i) => cardW0 + i * (cardW + cardGap) + cardW / 2);
  s += `<path d="M 640 ${pillY + 46} V ${spineY}" fill="none" stroke="${C.line}" stroke-width="2.2"/>`;
  s += `<path d="M ${cardXs[0]} ${spineY} H ${cardXs[2]}" fill="none" stroke="${C.line}" stroke-width="2.2"/>`;
  cardXs.forEach((x) => {
    s += arrow(x, spineY, x, cardY - 12);
  });

  return svgOpen(`  .blink { animation: blinkFill 2.4s ease-in-out infinite; }`) + s + `\n</svg>\n`;
}

/* ═══════════════════ ② 四维场景生成理解 ═══════════════════ */

function diagramFourD() {
  let s = '';

  s += text(640, 44, 'From multi-view observations to a 4D scene (3D + time)', {
    size: 20,
    fill: C.ink,
    weight: 700,
  });

  // —— 输入：多视图 + 相机轨迹 ——
  s += box({ x: 56, y: 92, w: 300, h: 232, rx: 12, fill: C.white });
  s += miniScene(78, 116, 168, 104, 'day', { seed: 21 });
  s += miniScene(98, 150, 168, 104, 'day', { seed: 22 });
  s += miniScene(118, 184, 168, 104, 'day', { seed: 23 });
  s += cameraIcon(268, 150, 0.85);
  s += cameraIcon(288, 196, 0.85);
  s += curve('M 262 160 C 300 186, 300 214, 268 232', { color: C.warn, sw: 2, marker: 'arrowWarn', dash: '6 5' });
  s += text(206, 306, 'Multi-view input', { size: 18, fill: C.ink, weight: 700, maxW: 280 });
  s += text(206, 328, 'images / video with camera poses', { size: 12, maxW: 290 });

  // —— 神经三维表示 ——
  const rep = { x: 396, y: 92, w: 268, h: 232 };
  s += box({ x: rep.x, y: rep.y, w: rep.w, h: rep.h, fill: C.accentSoft, stroke: C.accent, sw: 2 });
  s += text(rep.x + rep.w / 2, rep.y + 34, 'Neural 3D representation', { size: 16, fill: C.ink, weight: 700, maxW: rep.w - 20 });
  s += gaussians(rep.x + rep.w / 2, rep.y + 108, 0.62);
  s += pointCloud(rep.x + rep.w / 2, rep.y + 112, 0.62, 'car', C.ink);
  s += text(rep.x + rep.w / 2, rep.y + 190, 'implicit field · Gaussians', { size: 12, maxW: rep.w - 20 });
  s += text(rep.x + rep.w / 2, rep.y + 212, 'geometry + appearance', { size: 12, maxW: rep.w - 20 });
  s += arrow(356, 208, rep.x - 14, 208);

  // —— 输出：三维场景（含语义分块）——
  const sc = { x: 704, y: 92, w: 520, h: 232 };
  s += box({ x: sc.x, y: sc.y, w: sc.w, h: sc.h, fill: C.white });
  s += text(sc.x + sc.w / 2, sc.y + 34, '4D scene', { size: 18, fill: C.ink, weight: 800, maxW: sc.w - 20 });
  s += text(sc.x + sc.w / 2, sc.y + 56, 'geometry · appearance · semantics · motion', { size: 12, maxW: sc.w - 20 });
  s += gaussians(sc.x + 132, sc.y + 132, 0.6);
  s += wireBox(sc.x + 300, sc.y + 140, 98, 74, 52, { color: C.accentDark, sw: 2.4 });
  s += pointCloud(sc.x + 300, sc.y + 140, 0.5, 'car', C.accent);
  s += poseAxes(sc.x + 300, sc.y + 176, 0.7);
  s += text(sc.x + 300, sc.y + 212, 'object instance', { size: 12, maxW: 160 });
  s += text(sc.x + 132, sc.y + 212, 'appearance', { size: 12, maxW: 140 });
  s += arrow(rep.x + rep.w + 14, 208, sc.x - 14, 208);

  // —— 时间轴：第四维 ——
  // 注意：这一行必须排在输入框（含它下面的标签）之后，否则快照框会压住输入框
  const axisY = 470;
  s += arrow(150, axisY, 1150, axisY, { color: C.muted, sw: 2 });
  s += text(1180, axisY + 8, 't', { size: 20, fill: C.muted, weight: 700 });
  s += text(640, axisY + 38, 'Time — the fourth dimension', { size: 18, fill: C.ink, weight: 700 });

  const stamps = [
    { cx: 300, t: 't₁' },
    { cx: 640, t: 't₂' },
    { cx: 980, t: 't₃' },
  ];
  stamps.forEach((st, i) => {
    const bx = st.cx - 96;
    const by = axisY - 124;
    s += `<g class="pulse" style="animation-delay:${i * 0.7}s">`;
    s += box({ x: bx, y: by, w: 192, h: 104, fill: C.white });
    s += `</g>`;
    // 该时刻的三维场景：线框随时间轻微位移，表现「动」
    const dx = i * 7;
    s += wireBox(bx + 70 + dx, by + 60, 52, 40, 26, { color: C.accent, sw: 1.8 });
    s += text(bx + 140, by + 48, st.t, { size: 22, fill: C.accentDark, weight: 800 });
    s += text(bx + 140, by + 72, `frame ${i + 1}`, { size: 11 });
    s += arrow(st.cx, by + 116, st.cx, axisY - 14, { color: C.muted, sw: 1.8 });
  });

  // —— 应用输出 ——
  const apps = [
    { label: 'Novel view synthesis', sub: 'render unseen viewpoints', kind: 'view' },
    { label: '3D semantic understanding', sub: 'part & instance segmentation', kind: 'sem' },
    { label: 'Dynamic scene modelling', sub: 'track and edit over time', kind: 'dyn' },
  ];
  const cardW = 372;
  const cardGap = 42;
  const cardW0 = (W - (cardW * 3 + cardGap * 2)) / 2;
  const cardY = 548;

  apps.forEach((a, i) => {
    const x = cardW0 + i * (cardW + cardGap);
    s += box({ x, y: cardY, w: cardW, h: 178, label: a.label, size: 18, labelOffsetY: 34 });
    s += text(x + cardW / 2, cardY + 58, a.sub, { size: 12, maxW: cardW - 24 });
    const ax = x + 30;
    const ay = cardY + 74;
    const aw = cardW - 60;
    const ah = 82;

    if (a.kind === 'view') {
      s += miniScene(ax, ay, aw, ah, 'day', { seed: 31 });
      s += cameraIcon(ax + 26, ay + ah - 16, 0.7, C.warn);
      s += `<rect x="${ax + aw * 0.6}" y="${ay + 8}" width="${aw * 0.34}" height="${ah - 16}" rx="6" fill="${C.warnSoft}" stroke="${C.warn}" stroke-width="2"/>`;
      s += text(ax + aw * 0.77, ay + ah / 2 + 5, 'new view', { size: 12, fill: C.warn, weight: 700, maxW: aw * 0.3 });
    } else if (a.kind === 'sem') {
      s += wireBox(ax + aw * 0.42, ay + ah * 0.56, 96, 54, 40, { color: C.accentDark, sw: 2 });
      s += `<path d="M ${ax + aw * 0.42 - 48} ${ay + ah * 0.56} l 48 -14 v 40 l -48 14 z" fill="${C.ok}" opacity="0.45"/>`;
      s += `<path d="M ${ax + aw * 0.42} ${ay + ah * 0.56 - 14} l 48 -10 v 40 l -48 14 z" fill="${C.warn}" opacity="0.45"/>`;
      s += text(ax + aw * 0.82, ay + ah * 0.5, 'parts', { size: 12, fill: C.muted, maxW: 110, anchor: 'middle' });
    } else {
      s += miniScene(ax, ay, aw * 0.28, ah, 'day', { seed: 41 });
      s += miniScene(ax + aw * 0.36, ay, aw * 0.28, ah, 'day', { seed: 42 });
      s += miniScene(ax + aw * 0.72, ay, aw * 0.28, ah, 'day', { seed: 43 });
      s += arrow(ax + aw * 0.3, ay + ah / 2, ax + aw * 0.34, ay + ah / 2, { color: C.warn, sw: 2, marker: 'arrowWarn' });
      s += arrow(ax + aw * 0.66, ay + ah / 2, ax + aw * 0.7, ay + ah / 2, { color: C.warn, sw: 2, marker: 'arrowWarn' });
    }
  });

  return svgOpen() + s + `\n</svg>\n`;
}

/* ═══════════════════ ③ 具身智能与智能体 ═══════════════════ */

function diagramEmbodied() {
  let s = '';

  s += text(640, 44, 'Perceive — reason — act, in a closed loop', {
    size: 20,
    fill: C.ink,
    weight: 700,
  });

  /* —— 左：桌面场景 + 语言指令 —— */
  const sceneX = 56;
  const sceneY = 130;
  const sceneW = 384;
  const sceneH = 250;
  s += box({ x: sceneX, y: sceneY, w: sceneW, h: sceneH, rx: 12, fill: C.white });

  // 指令气泡
  s += `<path d="M ${sceneX + 26} ${sceneY - 10} h 250 a 14 14 0 0 1 14 14 v 30 a 14 14 0 0 1 -14 14 h -212 l -18 16 v -16 h -20 a 14 14 0 0 1 -14 -14 v -30 a 14 14 0 0 1 14 -14 z" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="1.8"/>`;
  s += text(sceneX + 150, sceneY + 24, '"Put the red block in the box"', { size: 15, fill: C.ink, weight: 700, maxW: 250 });

  // 桌面 + 物体
  const tableY = sceneY + sceneH - 74;
  s += `<rect x="${sceneX + 16}" y="${tableY}" width="${sceneW - 32}" height="12" rx="4" fill="#C9D8E6"/>`;
  s += `<rect x="${sceneX + 16}" y="${tableY + 12}" width="${sceneW - 32}" height="8" fill="#B4C6D6" opacity="0.7"/>`;
  // 红色方块（带 6D 位姿坐标轴）
  const blk = { x: sceneX + 108, y: tableY - 46, w: 62, h: 46 };
  s += `<rect x="${blk.x}" y="${blk.y}" width="${blk.w}" height="${blk.h}" rx="4" fill="#E1785F" stroke="#B8543C" stroke-width="1.6"/>`;
  s += `<path d="M ${blk.x} ${blk.y} l 16 -12 h 62 l -16 12 z" fill="#EFA794" stroke="#B8543C" stroke-width="1.4"/>`;
  s += poseAxes(blk.x + blk.w / 2, blk.y + 10, 0.62);
  s += callout(blk.x - 8, blk.y - 26, blk.w + 22, blk.h + 34, '6D pose', { side: 'top', size: 11 });
  // 目标盒子
  s += `<path d="M ${sceneX + 262} ${tableY - 40} h 74 v 40 h -74 z" fill="#DCE7F0" stroke="#94AEC4" stroke-width="1.6"/>`;
  s += `<path d="M ${sceneX + 262} ${tableY - 40} l 18 -14 h 74 l -18 14 z" fill="#EDF3F8" stroke="#94AEC4" stroke-width="1.4"/>`;
  s += `<path d="M ${sceneX + 336} ${tableY - 40} l 18 -14 v 40 l -18 14 z" fill="#CBD9E5" stroke="#94AEC4" stroke-width="1.4"/>`;
  // 机械臂
  s += robotArm(sceneX + 74, tableY + 2, 0.82, { bend: -38 });
  s += text(sceneX + sceneW / 2, sceneY + sceneH + 26, 'Robot, objects and a language goal', { size: 12, maxW: sceneW });

  /* —— 中：智能体规划 —— */
  const plan = { x: 492, y: 130, w: 268, h: 250 };
  s += box({ x: plan.x, y: plan.y, w: plan.w, h: plan.h, fill: C.accentSoft, stroke: C.accent, sw: 2 });
  s += text(plan.x + plan.w / 2, plan.y + 36, 'Agent / VLM planner', { size: 17, fill: C.ink, weight: 800, maxW: plan.w - 20 });
  s += text(plan.x + plan.w / 2, plan.y + 58, 'vision · language · action', { size: 12, maxW: plan.w - 20 });
  ['1  locate the red block', '2  plan a grasp pose', '3  place it into the box'].forEach((line, i) => {
    s += box({ x: plan.x + 20, y: plan.y + 76 + i * 44, w: plan.w - 40, h: 36, rx: 8, fill: C.white, label: line, labelFill: C.ink, size: 12 });
  });
  s += text(plan.x + plan.w / 2, plan.y + 226, 'step-by-step plan', { size: 12, maxW: plan.w - 20 });
  s += arrow(sceneX + sceneW + 14, sceneY + 100, plan.x - 14, sceneY + 100);

  /* —— 右：动作回放（论文里常见的 storyboard） —— */
  const roll = { x: 812, y: 130, w: 412, h: 250 };
  s += box({ x: roll.x, y: roll.y, w: roll.w, h: roll.h, rx: 12, fill: C.white });
  s += text(roll.x + roll.w / 2, roll.y + 30, 'Action rollout', { size: 17, fill: C.ink, weight: 800, maxW: roll.w - 20 });
  const frW = 118;
  const frH = 130;
  const frY = roll.y + 50;
  [
    { bend: -8, grip: 1, label: 'approach' },
    { bend: -40, grip: 0.5, label: 'grasp' },
    { bend: -58, grip: 0.5, label: 'place' },
  ].forEach((f, i) => {
    const fx = roll.x + 18 + i * (frW + 16);
    s += `<rect x="${fx}" y="${frY}" width="${frW}" height="${frH}" rx="8" fill="${C.bg}" stroke="${C.nodeStroke}" stroke-width="1.4"/>`;
    // 每帧里桌面 + 方块位置不同
    s += `<line x1="${fx + 10}" y1="${frY + frH - 26}" x2="${fx + frW - 10}" y2="${frY + frH - 26}" stroke="#C9D8E6" stroke-width="6" stroke-linecap="round"/>`;
    const bx = fx + 52 + i * 14;
    s += `<rect x="${bx}" y="${frY + frH - 46}" width="26" height="20" rx="3" fill="#E1785F" stroke="#B8543C" stroke-width="1.2" opacity="${i === 2 ? 0.45 : 1}"/>`;
    s += robotArm(fx + 30, frY + frH - 24, 0.44, { bend: f.bend, open: f.grip });
    s += text(fx + frW / 2, frY + frH + 20, f.label, { size: 12, fill: C.ink, weight: 700, maxW: frW });
    if (i < 2) s += arrow(fx + frW + 2, frY + frH / 2, fx + frW + 14, frY + frH / 2, { color: C.warn, sw: 2, marker: 'arrowWarn' });
  });
  s += arrow(plan.x + plan.w + 14, sceneY + 100, roll.x - 14, sceneY + 100);

  /* —— 回环：结果反馈回去 —— */
  s += curve(`M ${roll.x + roll.w / 2} ${roll.y + roll.h + 12} V 452 H ${sceneX + sceneW / 2} V ${sceneY + sceneH + 46}`, {
    color: C.accent,
    sw: 2.4,
    marker: 'arrowFlow',
    cls: 'flow',
  });
  s += box({ x: 470, y: 424, w: 340, h: 44, rx: 22, fill: C.white, stroke: C.accent, sw: 1.8, label: 'observe the result, re-plan if needed', size: 13 });

  /* —— 底部：方向覆盖的其它内容 —— */
  [
    { label: 'Embodied navigation', sub: 'map · plan · traverse', kind: 'nav' },
    { label: 'Human–robot collaboration', sub: 'share a workspace safely', kind: 'hrc' },
    { label: 'Sim-to-real transfer', sub: 'train in simulation, deploy for real', kind: 'sim' },
  ].forEach((b, i) => {
    const bw = 372;
    const x = (W - (bw * 3 + 42 * 2)) / 2 + i * (bw + 42);
    s += box({ x, y: 540, w: bw, h: 178, label: b.label, size: 18, labelOffsetY: 34 });
    s += text(x + bw / 2, 540 + 58, b.sub, { size: 12, maxW: bw - 24 });
    const ax = x + 30;
    const ay = 540 + 74;
    const aw = bw - 60;
    const ah = 82;
    if (b.kind === 'nav') {
      // 平面图 + 路径
      s += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="8" fill="${C.bg}" stroke="${C.nodeStroke}" stroke-width="1.4"/>`;
      s += `<rect x="${ax + 14}" y="${ay + 12}" width="${aw * 0.26}" height="${ah * 0.34}" fill="${C.accentSoft}" stroke="${C.line}" stroke-width="1.2"/>`;
      s += `<rect x="${ax + aw * 0.62}" y="${ay + ah * 0.52}" width="${aw * 0.26}" height="${ah * 0.34}" fill="${C.accentSoft}" stroke="${C.line}" stroke-width="1.2"/>`;
      s += curve(`M ${ax + 22} ${ay + ah - 16} C ${ax + aw * 0.4} ${ay + ah - 12}, ${ax + aw * 0.46} ${ay + 20}, ${ax + aw - 24} ${ay + 18}`, { color: C.warn, sw: 2.4, marker: 'arrowWarn', dash: '7 5' });
      s += dot(ax + 22, ay + ah - 16, 4, C.warn);
    } else if (b.kind === 'hrc') {
      s += robotArm(ax + 40, ay + ah - 8, 0.5, { bend: -30 });
      // 人的简化剪影
      s += `<g stroke="${C.muted}" stroke-width="4" fill="none" stroke-linecap="round">
        <circle cx="${ax + aw - 54}" cy="${ay + 26}" r="11"/>
        <line x1="${ax + aw - 54}" y1="${ay + 37}" x2="${ax + aw - 54}" y2="${ay + 62}"/>
        <line x1="${ax + aw - 54}" y1="${ay + 62}" x2="${ax + aw - 66}" y2="${ay + ah - 6}"/>
        <line x1="${ax + aw - 54}" y1="${ay + 62}" x2="${ax + aw - 42}" y2="${ay + ah - 6}"/>
        <line x1="${ax + aw - 54}" y1="${ay + 46}" x2="${ax + aw - 30}" y2="${ay + 54}"/>
      </g>`;
      s += `<circle cx="${ax + aw * 0.62}" cy="${ay + ah - 30}" r="16" fill="none" stroke="${C.warn}" stroke-width="2" stroke-dasharray="5 4"/>`;
    } else {
      s += `<rect x="${ax}" y="${ay}" width="${aw * 0.44}" height="${ah}" rx="8" fill="${C.accentSoft}" stroke="${C.line}" stroke-width="1.4"/>`;
      s += `<rect x="${ax + aw * 0.56}" y="${ay}" width="${aw * 0.44}" height="${ah}" rx="8" fill="${C.white}" stroke="${C.line}" stroke-width="1.4"/>`;
      s += text(ax + aw * 0.22, ay + ah / 2 + 5, 'sim', { size: 14, fill: C.accentDark, weight: 700 });
      s += text(ax + aw * 0.78, ay + ah / 2 + 5, 'real', { size: 14, fill: C.ink, weight: 700 });
      s += arrow(ax + aw * 0.45, ay + ah / 2, ax + aw * 0.55, ay + ah / 2, { color: C.warn, sw: 2.4, marker: 'arrowWarn' });
    }
  });

  return svgOpen() + s + `\n</svg>\n`;
}

/* ═══════════════════ ④ 遥感目标智能感知 ═══════════════════ */

function diagramRemoteSensing() {
  let s = '';

  s += text(640, 44, 'Detecting oriented, dense and tiny targets in remote sensing images', {
    size: 19,
    fill: C.ink,
    weight: 700,
    maxW: 1000,
  });

  /* —— 左：卫星影像 + 旋转框 + 难点标注 —— */
  const tile = { x: 56, y: 116, w: 396, h: 288 };
  s += box({ x: tile.x - 8, y: tile.y - 8, w: tile.w + 16, h: tile.h + 16, rx: 12, fill: C.white });
  s += miniScene(tile.x, tile.y, tile.w, tile.h, 'sat', { seed: 17, rx: 8 });
  // 港口里的小船（密集 + 旋转）
  const ships = [
    { x: 0.22, y: 0.68, w: 40, h: 15, a: -34 },
    { x: 0.33, y: 0.62, w: 34, h: 13, a: 26 },
    { x: 0.46, y: 0.72, w: 30, h: 12, a: -12 },
    { x: 0.58, y: 0.64, w: 36, h: 14, a: 42 },
    { x: 0.3, y: 0.8, w: 26, h: 11, a: 8 },
    { x: 0.68, y: 0.78, w: 22, h: 10, a: -28 },
  ];
  ships.forEach((sh, i) => {
    const cx = tile.x + tile.w * sh.x;
    const cy = tile.y + tile.h * sh.y;
    s += `<rect x="${(cx - sh.w / 2).toFixed(1)}" y="${(cy - sh.h / 2).toFixed(1)}" width="${sh.w}" height="${sh.h}" rx="3" fill="#E8EFF5" opacity="0.9" transform="rotate(${sh.a} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
    if (i < 4) {
      s += `<g class="pulse" style="animation-delay:${i * 0.6}s">`;
      s += orientedRect(cx, cy, sh.w + 12, sh.h + 12, sh.a, { stroke: C.warn, sw: 2.6 });
      s += `</g>`;
    }
  });
  // 一架飞机（大目标，用来体现尺度差异）
  s += `<path d="M ${tile.x + tile.w * 0.62} ${tile.y + tile.h * 0.26} l 34 -12 l 6 6 l -34 12 z" fill="#EDF3F8" opacity="0.95"/>`;
  s += `<path d="M ${tile.x + tile.w * 0.66} ${tile.y + tile.h * 0.22} l -6 -16 l 8 -2 l 8 16 z" fill="#E3EBF2" opacity="0.95"/>`;
  s += orientedRect(tile.x + tile.w * 0.65, tile.y + tile.h * 0.24, 62, 26, -18, { stroke: C.warn, sw: 2.6 });

  s += callout(tile.x + tile.w * 0.16, tile.y + tile.h * 0.58, tile.w * 0.5, tile.h * 0.28, 'dense & rotated', { side: 'bottom', size: 11 });
  s += callout(tile.x + tile.w * 0.58, tile.y + tile.h * 0.14, 92, 56, 'tiny vs large', { side: 'top', size: 11 });
  s += text(tile.x + tile.w / 2, tile.y + tile.h + 40, 'Satellite / aerial image', { size: 18, fill: C.ink, weight: 700, maxW: tile.w + 60 });
  s += text(tile.x + tile.w / 2, tile.y + tile.h + 62, 'oriented boxes mark every target', { size: 12, maxW: tile.w + 60 });

  /* —— 中：骨干 + 特征金字塔 + 检测头 —— */
  const bb = { x: 508, y: 116, w: 264, h: 88 };
  s += box({ x: bb.x, y: bb.y, w: bb.w, h: bb.h, label: 'Backbone', size: 19, fill: C.white });
  s += arrow(tile.x + tile.w + 24, tile.y + tile.h / 2, bb.x - 14, bb.y + bb.h / 2);

  // 特征金字塔（三级，越往下越大）
  const fpnY = bb.y + bb.h + 44;
  const levels = [
    { w: 244, h: 40, label: 'P3  fine' },
    { w: 196, h: 40, label: 'P4' },
    { w: 148, h: 40, label: 'P5  coarse' },
  ];
  levels.forEach((lv, i) => {
    const lx = bb.x + (bb.w - lv.w) / 2;
    const ly = fpnY + i * 48;
    s += box({ x: lx, y: ly, w: lv.w, h: lv.h, rx: 8, fill: C.accentSoft, stroke: C.accent, sw: 1.6, label: lv.label, labelFill: C.ink, size: 12 });
  });
  s += text(bb.x + bb.w / 2, fpnY - 16, 'Multi-scale features', { size: 15, fill: C.ink, weight: 700, maxW: bb.w });
  s += arrow(bb.x + bb.w / 2, bb.y + bb.h + 14, bb.x + bb.w / 2, fpnY - 6);

  // 检测头：两条分支
  const hdY = fpnY + 3 * 48 + 16;
  s += box({ x: bb.x, y: hdY, w: bb.w, h: 84, label: 'Detection head', size: 17, fill: C.white, labelOffsetY: 28 });
  s += box({ x: bb.x + 16, y: hdY + 40, w: 110, h: 30, rx: 8, fill: C.warnSoft, stroke: C.warn, sw: 1.6, label: 'class', size: 12 });
  s += box({ x: bb.x + 138, y: hdY + 40, w: 110, h: 30, rx: 8, fill: C.warnSoft, stroke: C.warn, sw: 1.6, label: 'angle + box', size: 12 });
  s += arrow(bb.x + bb.w / 2, fpnY + 3 * 48 - 8, bb.x + bb.w / 2, hdY - 8);

  /* —— 右：输出（含角度）—— */
  const out = { x: 856, y: 116, w: 368, h: 288 };
  s += box({ x: out.x, y: out.y, w: out.w, h: out.h, label: 'Oriented detections', size: 18, labelOffsetY: 34 });
  const rows = [
    { t: 'ship', a: 'θ = −34°', s: '32 × 12 px' },
    { t: 'ship', a: 'θ = 26°', s: '28 × 11 px' },
    { t: 'aircraft', a: 'θ = −18°', s: '62 × 26 px' },
    { t: 'harbour', a: 'θ = 8°', s: '120 × 48 px' },
  ];
  rows.forEach((r, i) => {
    const ry = out.y + 74 + i * 52;
    s += `<g class="pulse" style="animation-delay:${i * 0.5}s">`;
    s += orientedRect(out.x + 40, ry, 40, 18, i * 11 - 16, { stroke: C.warn, sw: 2.4 });
    s += `</g>`;
    s += text(out.x + 92, ry - 2, r.t, { size: 15, fill: C.ink, weight: 700, anchor: 'start' });
    s += text(out.x + 92, ry + 20, `${r.a}   ${r.s}`, { size: 11, anchor: 'start' });
    s += text(out.x + out.w - 24, ry + 6, 'conf 0.9', { size: 11, anchor: 'end' });
  });
  s += arrow(bb.x + bb.w + 20, hdY + 42, out.x - 14, out.y + 150, { color: C.line, sw: 2 });

  /* —— 底部：为什么需要「有向框」的对比（论文式对比面板） —— */
  const cmpY = 508;
  const cmpW = 560;
  const cmpX = [56, 664];
  const cmpLabelY = 30;
  const cmpSceneY = cmpY + 58;
  const cmpSceneH = 100;
  const cmpCaptionY = cmpSceneY + cmpSceneH + 22;
  const cmpFootY = cmpY + 208;

  s += box({ x: cmpX[0], y: cmpY, w: cmpW, h: 236, label: 'Axis-aligned boxes', size: 18, labelOffsetY: cmpLabelY });
  s += box({ x: cmpX[1], y: cmpY, w: cmpW, h: 236, label: 'Oriented boxes', size: 18, labelOffsetY: cmpLabelY });

  [0, 1].forEach((k) => {
    const bx = cmpX[k];
    const ax = bx + 34;
    const ay = cmpSceneY;
    const aw = cmpW - 68;
    const ah = cmpSceneH;
    s += miniScene(ax, ay, aw, ah, 'sat', { seed: 51 + k });
    // 两个靠得很近、且带旋转的目标
    const objs = [
      { x: ax + aw * 0.3, y: ay + ah * 0.6, w: 64, h: 24, a: -32 },
      { x: ax + aw * 0.44, y: ay + ah * 0.68, w: 60, h: 22, a: -32 },
    ];
    objs.forEach((o) => {
      s += `<rect x="${(o.x - o.w / 2).toFixed(1)}" y="${(o.y - o.h / 2).toFixed(1)}" width="${o.w}" height="${o.h}" rx="4" fill="#E8EFF5" opacity="0.92" transform="rotate(${o.a} ${o.x.toFixed(1)} ${o.y.toFixed(1)})"/>`;
    });
    if (k === 0) {
      // 轴对齐：框相互重叠、还把另一个目标也框了进去
      s += axisRect(ax + aw * 0.37, ay + ah * 0.64, 116, 74, { stroke: C.muted, sw: 2.4 });
      s += axisRect(ax + aw * 0.62, ay + ah * 0.5, 68, 60, { stroke: C.muted, sw: 2.4, dash: '6 5' });
      s += crossMark(ax + aw * 0.62, ay + ah * 0.5, { s: 0.9 });
      s += text(ax + aw / 2, cmpCaptionY, 'overlap · loose · one target missed', { size: 12, fill: C.muted, maxW: aw });
      s += text(bx + cmpW / 2, cmpFootY, 'rotation is ignored', { size: 12, fill: '#C9503F', weight: 700, maxW: cmpW - 40 });
    } else {
      objs.forEach((o) => {
        s += orientedRect(o.x, o.y, o.w + 14, o.h + 14, o.a, { stroke: C.ok, sw: 2.6 });
      });
      s += checkMark(ax + aw * 0.72, ay + ah * 0.42, { s: 0.9 });
      s += text(ax + aw / 2, cmpCaptionY, 'tight · separated · orientations kept', { size: 12, fill: C.muted, maxW: aw });
      s += text(bx + cmpW / 2, cmpFootY, 'this is what the lab targets', { size: 12, fill: C.ok, weight: 700, maxW: cmpW - 40 });
    }
  });

  return svgOpen() + s + `\n</svg>\n`;
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

/* 版权说明：这四张图是自己画的，不涉及第三方素材 */
const credits = `# 研究方向配图说明

研究方向页的四张配图（\`multi-source.svg\` / \`4d-scene.svg\` / \`embodied.svg\` /
\`remote-sensing.svg\`）**是本项目自绘的矢量示意图**，由
[\`_tools/build-research-diagrams.mjs\`](../../_tools/build-research-diagrams.mjs) 生成。

因此：

- 不涉及任何第三方图片版权，不需要署名，也不需要 CC 授权声明；
- 配色取自站点的设计令牌（品牌蓝 \`#2E9BD6\`、海军蓝 \`#0E1F38\`、暖橙 \`#D9822B\`），
  与页面风格一致；
- 是 SVG 矢量图，点开放大不会糊；
- 四张都带动画（CSS 关键帧），并遵循系统的「减少动态效果」设置自动静止。
  **动画只改描边/颜色，不改透明度** —— 内容任何时刻都完整可见。

## 画法：按论文插图的思路组织

不是「方框 + 箭头」的流程示意，而是按顶级论文插图（teaser / framework figure）的
思路画：图里塞**具体的缩略图内容**（任务示例、结果、对比、难点标注），
让人一眼看出这个方向在解决什么问题。

| 方向 | 图里画了什么 |
|---|---|
| 多源数据智能分析 | 同一场景的五种模态缩略图（可见光 / 红外 / 深度 / SAR / 文本）→ 跨模态对齐与融合（注意力热图 + 共享表示）→ 三个下游任务的结果示例 |
| 四维场景生成理解 | 多视图序列 + 相机轨迹 → 神经三维表示（点云 + 高斯软斑）→ 四维场景 → 时间轴快照 t₁t₂t₃ → 三个应用（新视角合成 / 语义理解 / 动态建模） |
| 具身智能与智能体 | 桌面场景（机械臂 + 物体 + 6D 位姿坐标轴）+ 语言指令气泡 → VLM 规划器的分步计划 → 三段动作回放（接近 / 抓取 / 放置）→ 结果回环反馈；底部另画导航、人机协作、仿真到现实 |
| 遥感目标智能感知 | 密集小目标卫星影像（旋转框 + 「密集旋转 / 尺度悬殊」难点标注）→ 骨干 + 多尺度特征金字塔 + 检测头（分类 / 角度回归双分支）→ 含角度的输出列表 → **轴对齐 vs 有向框的对比面板** |

为什么这样画：卡片尺寸下文字读不出来，但**形状和颜色读得出来**。所以信息量主要
落在这些缩略图上，文字只做必要的标注。

## 重新生成

\`\`\`bash
node _tools/build-research-diagrams.mjs          # 生成四张 SVG + 本文件
node _tools/_preview-diagrams.mjs                # 拼成预览页，便于用浏览器肉眼检查
\`\`\`

改图只需要改生成脚本里的坐标与文案，**不要直接编辑 \`.svg\`** —— 它们是生成产物，
下次运行脚本会被覆盖。点云与 SAR 斑点用固定种子的伪随机数生成，保证每次输出一致。

本文件由 \`_tools/build-research-diagrams.mjs\` 自动生成。
`;

writeFileSync(join(OUT, 'research-CREDITS.md'), credits, 'utf8');

console.log(`\n共 ${FILES.length} 张，输出到 public/img/research/`);
console.log('版权说明写入 public/img/research/research-CREDITS.md');