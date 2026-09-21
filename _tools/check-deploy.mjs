/**
 * 部署前自检：把「本地能跑、推到 GitHub Pages 就坏」的几类问题提前抓出来。
 *
 * 检查项：
 *   1. 源文件里出现的每一处绝对资源路径（/img/... 之类）在 public/ 下是否真的存在
 *   2. 大小写是否与磁盘完全一致 —— GitHub Actions 跑在 Linux 上，大小写敏感。
 *      Windows 本地不区分大小写，写错大小写照样能跑；云端会直接 404。
 *   3. astro.config.mjs 的 site / base 与 public/robots.txt 的 Sitemap 是否一致
 *   4. dist/ 里各页面的资源引用是否能对上 public/ 的产物
 *
 * 用法：node _tools/check-deploy.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const problems = [];
const notes = [];

/* ── 1. 收集源码里的绝对资源引用 ───────────────────────────── */

const ASSET_EXT = /\.(png|jpe?g|webp|gif|svg|ico|avif|pdf|woff2?)$/i;

function walk(dir, filter) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
}

const sourceFiles = walk(path.join(ROOT, 'src'), (n) => /\.(astro|ts|css)$/.test(n));

// 匹配字符串字面量里以 / 开头、且带静态资源扩展名的路径
const ASSET_REF = /(['"`(])(\/[^'"`)\s]*\.(?:png|jpe?g|webp|gif|svg|ico|avif|pdf))/gi;

const refs = new Map(); // 资源路径 -> 引用的位置列表
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(ASSET_REF)) {
      const ref = m[2];
      if (!refs.has(ref)) refs.set(ref, []);
      refs.get(ref).push(`${path.relative(ROOT, file)}:${i + 1}`);
    }
  });
}

/* ── 2. 逐个核对：存在性 + 大小写 ─────────────────────────── */

// 逐段走目录，用 readdir 的原始大小写比对（fs.existsSync 在 Windows 上不区分大小写）
function exactCaseExists(relPath) {
  let cur = path.join(ROOT, 'public');
  if (!fs.existsSync(cur)) return { ok: false, reason: 'public/ 目录不存在' };
  const segments = relPath.split('/').filter(Boolean);
  for (const seg of segments) {
    const entries = fs.readdirSync(cur);
    if (entries.includes(seg)) {
      cur = path.join(cur, seg);
      continue;
    }
    const ci = entries.find((e) => e.toLowerCase() === seg.toLowerCase());
    return {
      ok: false,
      reason: ci ? `大小写不一致：磁盘上是 "${ci}"，代码里写的是 "${seg}"` : '文件不存在',
    };
  }
  return { ok: true };
}

for (const [ref, where] of [...refs].sort()) {
  const r = exactCaseExists(ref);
  if (!r.ok) {
    problems.push(`资源引用有问题：${ref}\n    ${r.reason}\n    出现在：${where.join('、')}`);
  }
}

notes.push(`扫描 ${sourceFiles.length} 个源文件，发现 ${refs.size} 个绝对资源引用`);

/* ── 3. 部署地址一致性 ───────────────────────────────────── */

/**
 * 取配置里真正生效的 site / base。
 *
 * 不能直接对整个文件跑正则：配置的注释里也写着 `base: '/homepage'` 这样的示例，
 * 会把注释当成真配置。也不能先把 `//` 当注释删掉 —— site 的值本身就含 `https://`。
 * 所以按行来：跳过注释行，只在行首匹配键名。
 */
function readConfigKeys() {
  const src = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
  const out = { site: null, base: '' };
  let inBlock = false;
  for (const rawLine of src.split(/\r?\n/)) {
    let line = rawLine;
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlock = false;
    }
    const open = line.indexOf('/*');
    if (open !== -1 && line.indexOf('*/', open) === -1) {
      inBlock = true;
      line = line.slice(0, open);
    }
    if (/^\s*(\/\/|\*)/.test(line)) continue; // 纯注释行
    const m = line.match(/^\s*(site|base):\s*['"]([^'"]*)['"]/);
    if (!m) continue;
    if (m[1] === 'site') out.site = m[2];
    else out.base = m[2];
  }
  return out;
}

const { site, base } = readConfigKeys();

if (!site) problems.push('astro.config.mjs 里没有配 site，sitemap 和 OG 卡片会拿到错误的绝对地址');
else notes.push(`site = ${site}${base ? `  base = ${base}` : '（根路径部署，无 base）'}`);

const robotsPath = path.join(ROOT, 'public', 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  const sm = robots.match(/Sitemap:\s*(\S+)/);
  if (!sm) problems.push('public/robots.txt 里没有 Sitemap 行');
  else if (site) {
    const expected = `${site.replace(/\/$/, '')}${base.replace(/\/$/, '')}/sitemap.xml`;
    if (sm[1] !== expected) {
      problems.push(`robots.txt 的 Sitemap 与 site/base 对不上\n    robots.txt 写的是 ${sm[1]}\n    按 site + base 应该是 ${expected}`);
    }
  }
} else {
  problems.push('public/robots.txt 不存在');
}

/* ── 3b. 根路径部署时，源码里不能有写死的 base 前缀 ─────────── */

if (!base) {
  for (const [ref, where] of refs) {
    if (/^\/[^/]+\//.test(ref) && !/^\/(img|people|brand|research)\//.test(ref)) {
      notes.push(`提醒：根路径部署下引用 ${ref}（${where[0]}），确认它是 public/ 下的真实路径`);
    }
  }
}

/* ── 4. package.json 与 package-lock.json 是否同步 ─────────
 * CI 里跑的是 `npm ci`，它要求两者严格一致，不一致会直接构建失败（本地 npm install 感觉不出来）。
 */

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const root = lock.packages && lock.packages[''];
  if (!root) {
    problems.push('package-lock.json 里没有根依赖信息（lockfileVersion 太旧？）');
  } else {
    const mismatches = [];
    for (const field of ['dependencies', 'devDependencies']) {
      const a = pkg[field] || {};
      const b = root[field] || {};
      for (const name of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (!(name in b)) mismatches.push(`${field} 里 ${name} 没进 lockfile`);
        else if (!(name in a)) mismatches.push(`${field} 里 ${name} 在 lockfile 里多余`);
        else if (a[name] !== b[name]) {
          mismatches.push(`${field} 里 ${name} 版本不一致：package.json=${a[name]}，lockfile=${b[name]}`);
        }
      }
    }
    if (mismatches.length) {
      problems.push(`package.json 与 package-lock.json 不同步，CI 的 npm ci 会失败：\n    ${mismatches.join('\n    ')}\n    本地跑一次 npm install 让 lockfile 跟上再提交`);
    } else {
      notes.push('package.json 与 package-lock.json 同步（npm ci 不会失败）');
    }
  }
} catch (e) {
  problems.push(`读取 package.json / package-lock.json 失败：${e.message}`);
}

/* ── 5. lockfile 的下载地址不能指向国内镜像 ────────────────
 * GitHub Actions 的构建机在美国，拉 registry.npmmirror.com 会失败，
 * 而国内本地拉它完全正常 —— 结果就是「本地能构建、CI 的 npm ci 秒退」。
 * 这个坑一旦踩了很难查，所以在部署前直接拦下来。
 */

try {
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const MIRRORS = [
    'registry.npmmirror.com',
    'registry.npm.taobao.org',
    'npm.taobao.org',
    'mirrors.cloud.tencent.com',
    'mirrors.huaweicloud.com',
  ];
  const found = new Map();
  for (const key of Object.keys(lock.packages || {})) {
    const r = lock.packages[key].resolved;
    if (!r || typeof r !== 'string') continue;
    for (const m of MIRRORS) {
      if (r.includes(`//${m}/`)) found.set(m, (found.get(m) || 0) + 1);
    }
  }
  if (found.size) {
    const detail = [...found].map(([m, c]) => `${m}（${c} 条）`).join('、');
    problems.push(
      `package-lock.json 里有下载地址指向国内镜像：${detail}\n` +
        '    GitHub 的构建机在美国，拉这些镜像会失败，npm ci 会直接退出。\n' +
        '    修法：node _tools/fix-lockfile-registry.mjs（换成官方源，版本与哈希都不变）',
    );
  } else {
    notes.push('lockfile 的下载地址均为官方源（CI 能正常拉取）');
  }
} catch (e) {
  problems.push(`读取 package-lock.json 失败：${e.message}`);
}

/* ── 6. 产物核对（dist/ 存在才查） ───────────────────────── */

const distDir = path.join(ROOT, 'dist');
let htmlFiles = [];
if (fs.existsSync(distDir)) {
  htmlFiles = walk(distDir, (n) => n.endsWith('.html'));
  const pointer = (p) => `${base.replace(/\/$/, '')}${p}`;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*\.(?:png|jpe?g|webp|gif|svg|ico|avif|css|js|woff2?))"/gi)) {
      const url = m[1];
      const onDisk = path.join(distDir, url);
      if (!fs.existsSync(onDisk)) {
        problems.push(`产物 ${rel} 引用了 ${url}，但 dist/ 里没有这个文件`);
      }
    }
  }
  notes.push(`核对 ${htmlFiles.length} 个产物页面的资源引用`);
} else {
  notes.push('dist/ 不存在，跳过产物核对（先跑一次 npm run build）');
}

/* ── 输出 ───────────────────────────────────────────────── */

for (const n of notes) console.log(`  · ${n}`);
console.log('');

if (problems.length) {
  console.log(`✗ 发现 ${problems.length} 个问题：\n`);
  for (const p of problems) console.log(`  - ${p}\n`);
  process.exit(1);
}

console.log('✓ 部署前自检通过：资源路径存在且大小写一致，部署地址自洽');