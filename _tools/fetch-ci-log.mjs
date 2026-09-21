import https from 'node:https';

/**
 * 读取某次 Actions 运行的失败信息。
 *
 * 日志正文（/actions/jobs/<id>/logs）需要仓库管理员权限，匿名读不到；
 * 但「注解（annotations）」对公开仓库是匿名可读的，而工作流里用
 *   echo "::error::..."
 * 输出的内容会变成注解。所以配合一个会打印错误的安装步骤，
 * 就能在不登录的情况下看到真正的报错。
 */

const OWNER = process.argv[2] || 'cKk038';
const REPO = process.argv[3] || 'cKk038.github.io';

function req(host, path, headers = {}) {
  return new Promise((resolve) => {
    const r = https.request(
      {
        host,
        path,
        method: 'GET',
        headers: { 'User-Agent': 'xi-lab-ci-check', Accept: 'application/vnd.github+json', ...headers },
        timeout: 25000,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => { b += c; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
      },
    );
    r.on('timeout', () => { r.destroy(); resolve({ status: 0, body: '超时' }); });
    r.on('error', (e) => resolve({ status: 0, body: e.code || e.message }));
    r.end();
  });
}

const runsRes = await req('api.github.com', `/repos/${OWNER}/${REPO}/actions/runs?per_page=5`);
if (runsRes.status !== 200) {
  console.log(`查询运行记录失败 HTTP ${runsRes.status}`);
  process.exit(1);
}

const runs = JSON.parse(runsRes.body).workflow_runs;
console.log(`最近 ${runs.length} 次运行：\n`);
for (const r of runs) {
  console.log(`  #${String(r.run_number).padStart(2)}  ${r.conclusion.padEnd(9)} ${r.created_at}  ${r.display_title}`);
}
console.log('');

const latest = runs[0];
const jobsRes = await req('api.github.com', `/repos/${OWNER}/${REPO}/actions/runs/${latest.id}/jobs`);
const jobs = JSON.parse(jobsRes.body).jobs;

for (const job of jobs) {
  if (job.conclusion !== 'failure') continue;
  const step = job.steps.find((s) => s.conclusion === 'failure');
  console.log(`失败作业「${job.name}」失败步骤「${step ? step.name : '(无)'}」\n`);

  // 各步骤耗时：能区分「秒退的校验错误」和「几十秒的网络超时」
  console.log('各步骤耗时：');
  for (const s of job.steps) {
    const dur = s.started_at && s.completed_at
      ? ((new Date(s.completed_at) - new Date(s.started_at)) / 1000).toFixed(1)
      : '-';
    if (s.conclusion === 'skipped') continue;
    console.log(`  ${String(s.number).padStart(2)}  ${String(dur).padStart(6)}s  ${s.conclusion.padEnd(9)} ${s.name}`);
  }
  console.log('');

  // 注解接口：对公开仓库匿名可读
  const checkRunId = job.check_run_url ? job.check_run_url.split('/').pop() : null;
  if (!checkRunId) {
    console.log('（这个作业没有 check run，读不到注解）');
    continue;
  }
  const ann = await req('api.github.com', `/repos/${OWNER}/${REPO}/check-runs/${checkRunId}/annotations`);
  if (ann.status !== 200) {
    console.log(`读取注解失败 HTTP ${ann.status}：${ann.body.slice(0, 200)}`);
    continue;
  }
  const list = JSON.parse(ann.body);
  if (!list.length) {
    console.log('这次运行没有任何注解（说明失败信息没有被打印成注解）。');
    console.log('工作流里加上把报错输出成 ::error:: 的步骤后，就能在这里看到原因。');
  } else {
    for (const a of list) {
      console.log(`[${a.annotation_level}] ${a.title || ''}`);
      console.log(`${a.message}\n`);
    }
  }
}