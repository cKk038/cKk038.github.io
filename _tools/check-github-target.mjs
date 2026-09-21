import https from 'node:https';

/**
 * 通过 api.github.com（本机可直接连通，无需改 hosts）查询：
 *   · 组织 XI-Lab-XDU 是否存在
 *   · 仓库 XI-Lab-XDU.github.io 是否已建
 *   · 该组织的站点是否已经在提供服务
 * 这决定了部署下一步具体要做什么。
 */

function api(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        host: 'api.github.com',
        port: 443,
        path,
        method: 'GET',
        headers: {
          'User-Agent': 'xi-lab-deploy-check',
          Accept: 'application/vnd.github+json',
        },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(body); } catch { /* 非 JSON 就留 null */ }
          resolve({ status: res.statusCode, json, raw: body.slice(0, 200) });
        });
      },
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: '超时' }); });
    req.on('error', (e) => resolve({ status: 0, error: e.code || e.message }));
    req.end();
  });
}

async function show(label, path, describe) {
  const r = await api(path);
  if (r.status === 0) {
    console.log(`${label}\n  查询失败：${r.error}\n`);
    return r;
  }
  console.log(`${label}\n  HTTP ${r.status}  ${describe(r)}\n`);
  return r;
}

// 1. 组织是否存在
const org = await show('① 组织 XI-Lab-XDU', '/orgs/XI-Lab-XDU', (r) =>
  r.status === 200
    ? `存在，仓库数 ${r.json.public_repos}，简介：${r.json.description || '(无)'}`
    : r.status === 404
      ? '不存在，或者它不是组织而是个人账号'
      : `无法判断（${r.raw}）`,
);

// 2. 目标仓库是否已建
const repo = await show('② 仓库 XI-Lab-XDU.github.io', '/repos/XI-Lab-XDU/XI-Lab-XDU.github.io', (r) =>
  r.status === 200
    ? `已存在（${r.json.private ? '私有' : '公开'}，默认分支 ${r.json.default_branch}，空仓库=${!r.json.size}）`
    : r.status === 404
      ? '还没建 —— 需要先建这个仓库'
      : `无法判断（${r.raw}）`,
);

// 3. 如果组织在，顺带列出它已有的仓库名，避免重名/看错
if (org.status === 200) {
  const list = await api('/orgs/XI-Lab-XDU/repos?per_page=100&sort=full_name');
  if (list.status === 200 && Array.isArray(list.json)) {
    console.log(`③ 组织下已有 ${list.json.length} 个仓库：`);
    for (const r of list.json) {
      const badge = r.name.toLowerCase() === 'xi-lab-xdu.github.io' ? '  ← 这就是组织站仓库' : '';
      console.log(`   ${r.name.padEnd(30)} ${r.private ? '私有' : '公开'}  默认分支 ${r.default_branch}${badge}`);
    }
  } else {
    console.log(`③ 仓库列表查询失败（HTTP ${list.status}）`);
  }
}

// 4. 站点是否已在提供服务
const site = await new Promise((resolve) => {
  const req = https.get('https://xi-lab-xdu.github.io/', { timeout: 15000 }, (res) => {
    res.resume();
    resolve(res.statusCode);
  });
  req.on('timeout', () => { req.destroy(); resolve(0); });
  req.on('error', () => resolve(0));
});
console.log(`\n④ 站点 https://xi-lab-xdu.github.io ${site ? `已可访问（HTTP ${site}）` : '还打不开（正常，仓库和 Pages 都还没配）'}`);