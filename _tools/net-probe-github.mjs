import net from 'node:net';
import tls from 'node:tls';

// github.com 的多个已知 IP（GitHub 在不同区域有不同段）
const ips = [
  '20.205.243.166', // 当前 DNS 解析结果（已确认连不上）
  '20.205.243.165',
  '20.205.243.168',
  '140.82.112.3',
  '140.82.112.4',
  '140.82.113.3',
  '140.82.113.4',
  '140.82.114.3',
  '140.82.114.4',
  '140.82.116.3',
  '20.27.177.113',
  '20.200.245.247',
];

function tcp(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port });
    const done = (v) => { sock.destroy(); resolve(v); };
    sock.setTimeout(timeout);
    sock.on('connect', () => done(true));
    sock.on('timeout', () => done(false));
    sock.on('error', () => done(false));
  });
}

// 能不能完成 TLS 握手、证书是否签给 GitHub —— 光 TCP 通不代表能用
function tlsProbe(host, port, servername, timeout = 8000) {
  return new Promise((resolve) => {
    const sock = tls.connect({ host, port, servername, rejectUnauthorized: false }, () => {
      const cert = sock.getPeerCertificate();
      const cn = cert && cert.subject ? cert.subject.CN : '(无)';
      const san = cert && cert.subjectaltname ? cert.subjectaltname.slice(0, 60) : '';
      sock.destroy();
      resolve({ ok: true, cn, san });
    });
    sock.setTimeout(timeout);
    sock.on('timeout', () => { sock.destroy(); resolve({ ok: false, reason: '超时' }); });
    sock.on('error', (e) => resolve({ ok: false, reason: e.code || e.message }));
  });
}

console.log('=== github.com 各 IP 的 443 连通性 ===\n');
let best = null;
for (const ip of ips) {
  const ok = await tcp(ip, 443);
  let extra = '';
  if (ok) {
    const t = await tlsProbe(ip, 443, 'github.com');
    if (t.ok) {
      extra = `  TLS 握手成功，证书 CN=${t.cn}`;
      if (/github/i.test(t.cn) || /github/i.test(t.san)) {
        extra += '  ← 证书是 GitHub 的，可以直接用';
        if (!best) best = ip;
      } else {
        extra += '  ← 证书不是 GitHub 的，可能被劫持';
      }
    } else {
      extra = `  TCP 通但 TLS 失败（${t.reason}）`;
    }
  }
  console.log(`${ip.padEnd(18)} ${ok ? 'TCP 通 ✓' : 'TCP 不通 ✗'}${extra}`);
}

console.log('\n=== SSH 方式（22 与 443 端口） ===\n');
for (const [host, port] of [['github.com', 22], ['ssh.github.com', 22], ['ssh.github.com', 443]]) {
  const ok = await tcp(host, port);
  console.log(`${(host + ':' + port).padEnd(24)} ${ok ? '可连通 ✓' : '连不上 ✗'}`);
}

console.log(`\n结论：${best ? `用 ${best} 替代 github.com 可以走通（见下方 hosts 方案）` : '这组 IP 都不行，需要代理'}`);