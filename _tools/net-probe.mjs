import net from 'node:net';
import dns from 'node:dns/promises';

const targets = [
  ['github.com', 443],
  ['codeload.github.com', 443],
  ['api.github.com', 443],
  ['registry.npmjs.org', 443],
  ['gitee.com', 443],
  ['ghfast.top', 443],
  ['www.xidian.edu.cn', 443],
];

console.log('域名解析 + TCP 443 连通性探测\n');

for (const [host, port] of targets) {
  let ip = '-';
  try {
    const res = await dns.lookup(host, { all: false });
    ip = res.address;
  } catch (e) {
    console.log(`${host.padEnd(24)} 解析失败: ${e.code}`);
    continue;
  }

  const ok = await new Promise((resolve) => {
    const sock = net.connect({ host, port });
    const done = (v) => { sock.destroy(); resolve(v); };
    sock.setTimeout(6000);
    sock.on('connect', () => done(true));
    sock.on('timeout', () => done(false));
    sock.on('error', () => done(false));
  });

  console.log(`${host.padEnd(24)} ${ip.padEnd(16)} ${ok ? '可连通 ✓' : '连不上 ✗'}`);
}