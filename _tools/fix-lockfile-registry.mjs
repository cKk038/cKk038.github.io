import fs from 'node:fs';

/**
 * 把 package-lock.json 里所有下载地址的域名从国内镜像换成官方源。
 *
 * 只改域名，版本号、包条目、integrity 校验哈希一律不动 —— 镜像与官方源
 * 的 tarball 内容一致，哈希仍然对得上；万一不一致，npm ci 会直接报
 * integrity 错误，不会静默装错。所以这个改写是安全且可验证的。
 *
 * 之所以要改：GitHub 的构建机在美国，拉 registry.npmmirror.com 会失败，
 * 而本机（国内）拉得好好的，导致「本地能构建、CI 秒退」这类难查的问题。
 */

const NGOs = [
  'registry.npmmirror.com',
  'registry.npm.taobao.org',
  'npm.taobao.org',
  'mirrors.cloud.tencent.com',
  'mirrors.huaweicloud.com',
];
const OFFICIAL = 'registry.npmjs.org';

const path = 'package-lock.json';
const before = fs.readFileSync(path, 'utf8');
const lock = JSON.parse(before);

const hits = {};
let changed = 0;

for (const key of Object.keys(lock.packages || {})) {
  const entry = lock.packages[key];
  if (!entry.resolved || typeof entry.resolved !== 'string') continue;
  for (const mirror of NGOs) {
    if (!entry.resolved.includes(`//${mirror}/`)) continue;
    hits[mirror] = (hits[mirror] || 0) + 1;
    entry.resolved = entry.resolved.replace(`//${mirror}/`, `//${OFFICIAL}/`);
    changed += 1;
    break;
  }
}

if (!changed) {
  console.log('没有需要改写的地址（已经全部指向官方源或其它域名）。');
} else {
  fs.writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`已改写 ${changed} 个下载地址：`);
  for (const [m, c] of Object.entries(hits)) console.log(`  ${m} → ${OFFICIAL}   共 ${c} 条`);
}

// 复核结果
const hosts = {};
for (const key of Object.keys(lock.packages || {})) {
  const r = lock.packages[key].resolved;
  if (!r) continue;
  try { hosts[new URL(r).host] = (hosts[new URL(r).host] || 0) + 1; } catch { /* 非 URL 条目 */ }
}
console.log('\n改写后 lockfile 里的下载域名：');
for (const [h, c] of Object.entries(hosts).sort((a, b) => b[1] - a[1])) console.log(`  ${h.padEnd(28)}${c}`);

// 顺带确认包条目数量没变（防止写坏文件）
const countBefore = Object.keys(JSON.parse(before).packages || {}).length;
const countAfter = Object.keys(lock.packages || {}).length;
console.log(`\n包条目数：改写前 ${countBefore}，改写后 ${countAfter} ${countBefore === countAfter ? '一致 ✓' : '不一致 ✗'}`);