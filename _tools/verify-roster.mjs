/**
 * 团队页数据校验。
 *
 * 把图片里那份名单（唯一真源）硬编码在这里，然后逐名去 dist/team/index.html 里查，
 * 确认每个名字都真的渲染出来了、年级分组正确、没有多也没有少。
 */
import fs from 'node:fs';

/* 从「科研团队」栏目抄下来的名单 */
const EXPECTED = {
  phd: {
    '2023': ['段松松'],
    '2024': ['李博翰'],
    '2025': ['王佳乐', '陈鹏宇', '王梓潼', '冯宇翔'],
    '2026': ['李永辉'],
  },
  master: {
    '2024': ['邢涵瑜', '戴敏婷', '钟新月', '解全涛', '李鹏辉', '周赫勋'],
    '2025': ['陈娟', '窦在庚', '袁政煜', '李佳琦', '苏诗杰', '张辉', '范丽琪'],
    '2026': ['苏佳慕', '余俊钦', '范永琰', '杨浩淋', '夏志强', '张浩', '李程凯'],
  },
  alumniPhd: {
    '2020': ['魏梓钰'],
    '2017': ['余颖'],
  },
  alumniMaster: {
    '2017': ['吴郊'],
    '2018': ['汤英智', '郭浩远', '姜馨蕊'],
    '2019': ['王肖祁', '刘良辰', '王岩', '赵静怡'],
    '2020': ['林任', '张鑫', '李梅杰', '曹梦晴', '张家楠'],
    '2021': ['曾子龙', '周秋百', '杨峰', '王子晗', '汪贤', '郑顾'],
    '2022': ['尹星一郎', '朱海洋', '漆承欢', '杨怡榕', '孔德辰', '刘换玲', '张胜', '田梦慧'],
    '2023': ['董文妍', '王敬源', '顾续', '孙嘉辰', '陈坤', '周仲源', '施浩远'],
  },
};

const allNames = Object.values(EXPECTED).flatMap((g) => Object.values(g).flat());
console.log(`名单总人数：${allNames.length}`);
for (const [k, g] of Object.entries(EXPECTED)) {
  console.log(`  ${k.padEnd(13)} ${Object.values(g).flat().length}`);
}

const html = fs.readFileSync('dist/team/index.html', 'utf8');

const missing = allNames.filter((n) => !html.includes(n));
console.log(`\n渲染检查：${missing.length === 0 ? '✓ 全部 63 人都在页面上' : '✗ 缺失 ' + missing.join('、')}`);

/* 年级分组：每个年级标签都要出现，且标签与下一个年级标签之间包含本组所有名字 */
let groupProblems = [];
for (const [category, groups] of Object.entries(EXPECTED)) {
  for (const [cohort, names] of Object.entries(groups)) {
    const label = `${cohort} 级`;
    const i = html.indexOf(label);
    if (i < 0) {
      groupProblems.push(`${category}/${cohort}: 找不到年级标签「${label}」`);
      continue;
    }
    // 下一个年级标签的起点（而不是当前标签自己的 </p>）
    let nextStart = html.indexOf('<p class="cohort__label">', i + label.length);
    // 该组之后如果没有下一个年级标签，就取到本类别的下一个大标题为止，或往后取一大段
    if (nextStart < 0) nextStart = i + 6000;
    const segment = html.slice(i, nextStart);
    const notInSegment = names.filter((n) => !segment.includes(n));
    if (notInSegment.length > 0) {
      groupProblems.push(`${category}/${cohort}: 「${label}」段落里缺 ${notInSegment.join('、')}`);
    }
  }
}
console.log(`\n年级分组检查：${groupProblems.length === 0 ? '✓ 每个年级标签下的人都对得上' : '✗\n  ' + groupProblems.join('\n  ')}`);

/* 研究方向：新的四个方向必须都渲染出来，配图必须存在 */
const researchHtml = fs.readFileSync('dist/research/index.html', 'utf8');
const expectedTopics = ['多源数据智能分析', '四维场景生成理解', '具身智能与智能体', '遥感目标智能感知'];
const missingTopics = expectedTopics.filter((tp) => !researchHtml.includes(tp));
console.log(`\n研究方向检查：${missingTopics.length === 0 ? '✓ 四个方向都已渲染' : '✗ 缺 ' + missingTopics.join('、')}`);

const imgRefs = [...new Set([...researchHtml.matchAll(/\/img\/research\/([^"]+)"/g)].map((m) => m[1]))];
console.log(`  方向配图：${imgRefs.join(', ') || '(无)'}`);
const missingImgs = imgRefs.filter((f) => !fs.existsSync(`dist/img/research/${f}`));
console.log(`  配图文件：${missingImgs.length === 0 ? '✓ 全部存在' : '✗ 缺失 ' + missingImgs.join(', ')}`);
console.log(`  图注（论文出处）：${(researchHtml.match(/project-card__credit/g) || []).length} 条`);

/* 论文页：应该已经没有任何方向筛选，只有年份分组 */
const pubHtml = fs.readFileSync('dist/publications/index.html', 'utf8');
const pubItems = (pubHtml.match(/class="pub-item"/g) || []).length;
const pubYears = (pubHtml.match(/class="pub-year"/g) || []).length;
const filters = (pubHtml.match(/class="pub-filter"/g) || []).length;
console.log(`\n论文页：${pubItems} 条论文，${pubYears} 个年份分组，方向筛选按钮 ${filters} 个`);
console.log(`  按年份列出（无方向分类）：${filters === 0 && pubYears > 0 ? '✓' : '✗ 仍存在筛选或没有分组'}`);
console.log(`研究页代表性论文板块：${researchHtml.includes('代表性论文') ? '✓ 已渲染' : '⚠ 缺失（selected 为空）'}`);

/* 负责人信息 */
const need = ['杨曦', 'Xi Yang', '华山特聘', '国家级青年人才', 'yangx@xidian.edu.cn', 'ISN'];
const missingDirector = need.filter((t) => !html.includes(t));
console.log(`\n负责人信息：${missingDirector.length === 0 ? '✓ 姓名/职称/简介/邮箱/单位齐全' : '✗ 缺 ' + missingDirector.join('、')}`);
console.log(`  头像：${html.includes('/img/people/yang-xi.jpg') ? '✓ 已引用' : '✗ 未引用'}`);