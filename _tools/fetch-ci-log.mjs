import https from 'node:https';

/**
 * 从 GitHub API 拉取某次 Actions 运行中失败步骤的日志，用来定位 CI 失败原因。
 * 公开仓库的日志接口可能需要认证；拿不到时会明确报出来，不猜。
 */

const OWNER = process.argv[2] || 'cKk038';
const REPO = process.argv[3] || 'cKk038.github.io';
const RUN_ID = process.argv[4] || '';

function request(host, path, headers = {}) {
  return new Promise((resolve) => {
    const req = https.request(
      { host, path, method: 'GET', headers: { 'User-Agent': 'xi-lab-deploy-check', ...headers }, timeout: 25000 },
      (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      },
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '请求超时' }); });
    req.on('error', (e) => resolve({ status: 0, body: e.code || e.message }));
    req.end();
  });
}

const GH = { Accept: 'application/vnd.github+json' };

async function findRun() {
  if (RUN_ID) return RUN_ID;
  const r = await request('api.github.com', `/repos/${OWNER}/${REPO}/actions/runs?per_page=1`, GH);
  if (r.status !== 200) {
    console.log(`查询运行记录失败：HTTP ${r.status}\n${r.body.slice(0, 300)}`);
    process.exit(1);
  }
  const run = JSON.parse(r.body).workflow_runs[0];
  console.log(`最近一次运行：#${run.run_number}「${run.display_title}」${run.conclusion}  ${run.created_at}\n`);
  return run.id;
}

const runId = await findRun();

const jobsRes = await request('api.github.com', `/repos/${OWNER}/${REPO}/actions/runs/${runId}/jobs`, GH);
if (jobsRes.status !== 200) {
  console.log(`查询作业失败：HTTP ${jobsRes.status}`);
  process.exit(1);
}

const jobs = JSON.parse(jobsRes.body).jobs;
const failedJob = jobs.find((j) => j.conclusion === 'failure');
if (!failedJob) {
  console.log('这次运行里没有失败的作业。');
  process.exit(0);
}

const failedStep = failedJob.steps.find((s) => s.conclusion === 'failure');
console.log(`失败作业：${failedJob.name}（job id ${failedJob.id}）`);
console.log(`失败步骤：${failedStep ? `「${failedStep.name}」` : '(整作业失败，无单独失败步骤)'}\n`);

// 日志接口只接受 application/vnd.github+json，返回 302 指向一个带签名的临时地址，
// 需要手动跟随（那台主机不在 github.com 上，本机可以直接连）。
async function fetchLog(owner, repo, jobId) {
  const r = await request('api.github.com', `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, GH);
  if (r.status === 200) return { ok: true, text: String(r.body) };
  if (r.status !== 301 && r.status !== 302) {
    return { ok: false, why: `HTTP ${r.status} ${String(r.body).slice(0, 200)}` };
  }

  const target = new URL(r.headers.location);
  const followed = await request(target.host, target.pathname + target.search, { Accept: '*/*' });
  if (followed.status !== 200) return { ok: false, why: `跟随重定向后 HTTP ${followed.status}` };
  return { ok: true, text: String(followed.body) };
}

const log = await fetchLog(OWNER, REPO, failedJob.id);

if (log.ok) {
  const text = log.text;
  // 去掉每行前面的时间戳，只留内容
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*/, ''));
  console.log('──── 日志（筛出关键行）────\n');
  const KEY = /npm (err|error|warn)|ERR!|ETIMEDOUT|ECONNRESET|EAI_AGAIN|ENOTFOUND|404 Not Found|403 Forbidden|Unsupported|not found|Missing:|lock file|can only install|error /i;
  const picked = lines.filter((l) => KEY.test(l));
  console.log(picked.length ? picked.slice(0, 80).join('\n') : '(没有匹配到关键行)');
  console.log('\n──── 日志末尾 15 行 ────\n');
  console.log(lines.slice(-15).join('\n'));
} else {
  console.log(`拉取日志失败：${log.why}`);
  console.log('（自己看日志：仓库 → Actions → 点进失败的运行 → 左侧「构建」→ 展开「安装依赖」）');
}