import https from 'node:https';

/**
 * 用一个「连得上的 GitHub IP」实际发 HTTP 请求，验证：
 *   1. 换 IP 之后 GitHub 是真的能用（不只是 TLS 握手成功）
 *   2. 组织 XI-Lab-XDU 是否存在
 *   3. 仓库 XI-Lab-XDU.github.io 是否已经建好（决定了下一步做什么）
 */

const IP = '20.205.243.165'; // 探测下来可用的 GitHub IP

function get(path, ip = IP) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        host: ip,
        servername: 'github.com',
        port: 443,
        path,
        method: 'GET',
        headers: { Host: 'github.com', 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => { if (body.length < 400000) body += c; });
        res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body }));
      },
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: '超时' }); });
    req.on('error', (e) => resolve({ status: 0, error: e.code || e.message }));
    req.end();
  });
}

for (const target of ['/', '/XI-Lab-XDU', '/XI-Lab-XDU/XI-Lab-XDU.github.io']) {
  const r = await get(target);
  if (r.status === 0) {
    console.log(`${target.padEnd(36)} 请求失败：${r.error}`);
    continue;
  }
  const label =
    r.status === 200 ? '存在 / 可访问' :
    r.status === 301 || r.status === 302 ? `重定向 → ${r.location}` :
    r.status === 404 ? '不存在（404）' : `HTTP ${r.status}`;
  console.log(`${target.padEnd(36)} ${label}`);
}