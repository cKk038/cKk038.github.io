/**
 * 团队成员
 *
 * 数据来源：实验室负责人杨曦老师的官方主页
 *   · 教师信息   https://web.xidian.edu.cn/yangx/index.html
 *   · 科研团队   https://web.xidian.edu.cn/yangx/team.html
 * 更新日期：2026-09-21
 *
 * ── 怎么写一个人 ────────────────────────────────────────────
 * 教师：
 *   { name: '杨曦', nameEn: 'Xi Yang',
 *     role: { zh: '教授', en: 'Professor' },
 *     photo: '/img/people/yang-xi.jpg',
 *     interests: { zh: '…', en: '…' },
 *     url: 'https://个人主页', email: 'x@y.edu.cn',
 *     bio: [{ zh: '第一段', en: '…' }],        // 可选：写了两行简介就会渲染成负责人详情区
 *     honors: [{ zh: '…', en: '…' }] },        // 可选：荣誉与学术兼职
 *
 * 学生 / 校友：
 *   { name: '段松松', cohort: '2023',
 *     note: { zh: '2025年国家奖学金', en: '2025 National Scholarship' } },
 *
 * · `cohort` 是年级，团队页会按年级分组显示（从高到低）。
 * · `nameEn` 不给的话英文页面也显示中文名 —— 中国人的姓名本来就不需要翻译，
 *   想给拼音就按下面杨老师那样补 nameEn。
 * · 只填 zh、把 en 留空字符串时，英文页面会回退显示中文。
 */

import type { L } from '../i18n/ui';

export interface Person {
  /** 中文名（主显示名） */
  name: string;
  /** 英文名 / 拼音，可选；英文页面优先显示它 */
  nameEn?: string;
  /** 职称 / 身份 / 负责人头衔 */
  role?: L;
  /** 头像路径；不给则渲染姓名色块 */
  photo?: string;
  /** 个人主页 */
  url?: string;
  /** 邮箱 */
  email?: string;
  /** 研究方向（教师用） */
  interests?: L;
  /** 个人简介，每段一条。有值时会渲染成负责人详情区 */
  bio?: L[];
  /** 荣誉奖励与学术兼职 */
  honors?: L[];
  /** 年级，如 '2023'。学生 / 校友用 */
  cohort?: string;
  /** 备注：获奖、毕业去向、所属研究院等 */
  note?: L;
}

/* ═══════════════════════════ 教师 ═══════════════════════════ */

export const faculty: Person[] = [
  {
    name: '杨曦',
    nameEn: 'Xi Yang',
    role: {
      zh: '教授 · 华山特聘 · 博士生导师 · 实验室负责人',
      en: 'Professor · Huashan Distinguished Professor · PhD Supervisor · Lab Director',
    },
    photo: '/img/people/yang-xi.jpg',
    email: 'yangx@xidian.edu.cn',
    url: 'https://web.xidian.edu.cn/yangx/index.html',
    interests: {
      zh: '多源数据智能分析、四维场景生成理解、具身智能与智能体、遥感目标智能感知',
      en: 'intelligent analysis of multi-source data, 4D scene generation and understanding, embodied intelligence and agents, intelligent perception of remote sensing targets',
    },
    bio: [
      {
        zh: '杨曦，教授，博士生导师，国家级青年人才，现任职于西安电子科技大学通信工程学院、ISN 国家重点实验室。陕西咸阳人，分别于 2010 年、2015 年在西安电子科技大学获得电子信息工程专业学士学位（本硕连读）与模式识别与智能系统专业博士学位（硕博连读，导师高新波教授）。2013—2014 年在美国德州大学圣安东尼奥分校联合培养（导师田奇教授）。',
        en: 'Xi Yang is a Professor and PhD supervisor at the School of Telecommunications Engineering, Xidian University, and a member of the State Key Laboratory of Integrated Services Networks (ISN). She received her B.Eng. in Electronic and Information Engineering (2010) and her PhD in Pattern Recognition and Intelligent Systems (2015) from Xidian University, where she was supervised by Prof. Xinbo Gao. From 2013 to 2014 she was a visiting student at the University of Texas at San Antonio, working with Prof. Qi Tian.',
      },
      {
        zh: '在 IEEE TPAMI、TIP、CVPR、ICCV、NeurIPS 等期刊与会议发表论文 100 余篇，授权专利 20 余项。主持国家自然科学基金面上基金（2 项）、陕西省重点产业创新链、陕西省重点研发计划、陕西省创新人才推进计划、中国博士后科学基金特别资助等项目。',
        en: 'She has published over 100 papers in journals and conferences including IEEE TPAMI, TIP, CVPR, ICCV and NeurIPS, and holds more than 20 granted patents. Her research has been supported by two General Programs of the National Natural Science Foundation of China, the Shaanxi Key Industrial Innovation Chain, the Shaanxi Key R&D Program, the Shaanxi Innovation Talent Promotion Program, and a Special Grant from the China Postdoctoral Science Foundation.',
      },
    ],
    honors: [
      {
        zh: '入选中国科协青年人才托举工程、全球前 2% 顶尖科学家榜单（连续两年）',
        en: 'Selected for the Young Elite Scientists Sponsorship Program of CAST and the World\'s Top 2% Scientists list (two consecutive years)',
      },
      {
        zh: '获陕西省杰出青年科学基金、陕西省青年科技新星、陕西省优秀博士学位论文、中国图象图形学学会自然科学二等奖',
        en: 'Shaanxi Distinguished Young Scholars Fund, Shaanxi Young Science & Technology Star, Shaanxi Outstanding Doctoral Dissertation, and the CSIG Natural Science Second Prize',
      },
      {
        zh: 'IEEE Senior Member；《The Visual Computer》等期刊编委；VALSE 执行领域主席委员会委员；中国图象图形学学会青年工作委员会委员、遥感图像专委会委员；中国计算机学会多媒体专委会委员',
        en: 'IEEE Senior Member; editorial board member of The Visual Computer and other journals; VALSE Executive Area Chair Committee; CSIG Youth Working Committee and Remote Sensing Image Committee; CCF Multimedia Committee',
      },
    ],
  },
];

/* ═══════════════════════ 在读博士研究生 ═══════════════════════ */

export const phdStudents: Person[] = [
  {
    name: '段松松',
    cohort: '2023',
    note: { zh: '校优秀博士学位论文资助、2025 年国家奖学金', en: 'Outstanding Doctoral Dissertation Grant; 2025 National Scholarship' },
  },
  { name: '李博翰', cohort: '2024' },
  { name: '王佳乐', cohort: '2025' },
  { name: '陈鹏宇', cohort: '2025' },
  { name: '王梓潼', cohort: '2025' },
  { name: '冯宇翔', cohort: '2025' },
  { name: '李永辉', cohort: '2026' },
];

/* ═══════════════════════ 在读硕士研究生 ═══════════════════════ */

export const masterStudents: Person[] = [
  {
    name: '邢涵瑜',
    cohort: '2024',
  },
  { name: '戴敏婷', cohort: '2024' },
  { name: '钟新月', cohort: '2024' },
  { name: '解全涛', cohort: '2024' },
  {
    name: '李鹏辉',
    cohort: '2024',
    note: { zh: '2025 年国家奖学金；杭州研究院', en: '2025 National Scholarship; Hangzhou Institute' },
  },
  { name: '周赫勋', cohort: '2024', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },
  { name: '陈娟', cohort: '2025' },
  { name: '窦在庚', cohort: '2025' },
  { name: '袁政煜', cohort: '2025' },
  { name: '李佳琦', cohort: '2025' },
  { name: '苏诗杰', cohort: '2025' },
  { name: '张辉', cohort: '2025', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },
  { name: '范丽琪', cohort: '2025', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },
  { name: '苏佳慕', cohort: '2026' },
  { name: '余俊钦', cohort: '2026' },
  { name: '范永琰', cohort: '2026' },
  { name: '杨浩淋', cohort: '2026' },
  { name: '夏志强', cohort: '2026' },
  { name: '张浩', cohort: '2026', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },
  { name: '李程凯', cohort: '2026', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },
];

/* ═══════════════════════ 毕业博士研究生 ═══════════════════════ */

export const alumniPhd: Person[] = [
  {
    name: '魏梓钰',
    cohort: '2020',
    note: {
      zh: '2023 年 6 月毕业；第四军医大学；校优秀博士学位论文；2021 年国家奖学金；硕博连读',
      en: 'PhD 2023.06; now at Fourth Military Medical University; Outstanding Doctoral Dissertation; 2021 National Scholarship; direct PhD track',
    },
  },
  {
    name: '余颖',
    cohort: '2017',
    note: {
      zh: '2023 年 12 月毕业；南京邮电大学；直博、与高新颖教授联合培养',
      en: 'PhD 2023.12; now at Nanjing University of Posts and Telecommunications; direct PhD, co-supervised with Prof. Xinying Gao',
    },
  },
];

/* ═══════════════════════ 毕业硕士研究生 ═══════════════════════ */

export const alumniMaster: Person[] = [
  {
    name: '吴郊',
    cohort: '2017',
    note: { zh: '校优秀硕士学位、2019 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2019 National Scholarship' },
  },

  {
    name: '汤英智',
    cohort: '2018',
    note: { zh: '校优秀硕士学位、2019 和 2020 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2019 & 2020 National Scholarship' },
  },
  { name: '郭浩远', cohort: '2018', note: { zh: '2020 年国家奖学金', en: '2020 National Scholarship' } },
  { name: '姜馨蕊', cohort: '2018', note: { zh: '2020 年国家奖学金', en: '2020 National Scholarship' } },

  { name: '王肖祁', cohort: '2019' },
  { name: '刘良辰', cohort: '2019', note: { zh: '2021 年国家奖学金', en: '2021 National Scholarship' } },
  { name: '王岩', cohort: '2019' },
  { name: '赵静怡', cohort: '2019', note: { zh: '2021 年国家奖学金', en: '2021 National Scholarship' } },

  { name: '林任', cohort: '2020' },
  { name: '张鑫', cohort: '2020', note: { zh: '2022 年国家奖学金', en: '2022 National Scholarship' } },
  { name: '李梅杰', cohort: '2020' },
  { name: '曹梦晴', cohort: '2020' },
  {
    name: '张家楠',
    cohort: '2020',
    note: { zh: '2022 年国家奖学金；广州研究院', en: '2022 National Scholarship; Guangzhou Institute' },
  },

  { name: '曾子龙', cohort: '2021' },
  { name: '周秋百', cohort: '2021' },
  { name: '杨峰', cohort: '2021' },
  {
    name: '王子晗',
    cohort: '2021',
    note: { zh: '校优秀硕士学位、2022 年国家奖学金；广州研究院', en: 'Outstanding Master\'s Thesis; 2022 National Scholarship; Guangzhou Institute' },
  },
  {
    name: '汪贤',
    cohort: '2021',
    note: { zh: '校优秀硕士学位；杭州研究院', en: 'Outstanding Master\'s Thesis; Hangzhou Institute' },
  },
  { name: '郑顾', cohort: '2021', note: { zh: '杭州研究院', en: 'Hangzhou Institute' } },

  {
    name: '尹星一郎',
    cohort: '2022',
    note: { zh: '校优秀硕士学位、2024 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2024 National Scholarship' },
  },
  { name: '朱海洋', cohort: '2022' },
  { name: '漆承欢', cohort: '2022', note: { zh: '校优秀硕士学位', en: 'Outstanding Master\'s Thesis' } },
  { name: '杨怡榕', cohort: '2022' },
  {
    name: '孔德辰',
    cohort: '2022',
    note: { zh: '校优秀硕士学位、2024 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2024 National Scholarship' },
  },
  {
    name: '刘换玲',
    cohort: '2022',
    note: { zh: '校优秀硕士学位；杭州研究院', en: 'Outstanding Master\'s Thesis; Hangzhou Institute' },
  },
  {
    name: '张胜',
    cohort: '2022',
    note: { zh: '校优秀硕士学位、2024 年国家奖学金；杭州研究院', en: 'Outstanding Master\'s Thesis; 2024 National Scholarship; Hangzhou Institute' },
  },
  {
    name: '田梦慧',
    cohort: '2022',
    note: { zh: '校优秀硕士学位、2024 年国家奖学金；杭州研究院', en: 'Outstanding Master\'s Thesis; 2024 National Scholarship; Hangzhou Institute' },
  },

  {
    name: '董文妍',
    cohort: '2023',
    note: { zh: '校优秀硕士学位、2025 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2025 National Scholarship' },
  },
  { name: '王敬源', cohort: '2023', note: { zh: '校优秀硕士学位', en: 'Outstanding Master\'s Thesis' } },
  {
    name: '顾续',
    cohort: '2023',
    note: { zh: '校优秀硕士学位、2025 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2025 National Scholarship' },
  },
  {
    name: '孙嘉辰',
    cohort: '2023',
    note: { zh: '校优秀硕士学位、2025 年国家奖学金', en: 'Outstanding Master\'s Thesis; 2025 National Scholarship' },
  },
  { name: '陈坤', cohort: '2023', note: { zh: '校优秀硕士学位', en: 'Outstanding Master\'s Thesis' } },
  {
    name: '周仲源',
    cohort: '2023',
    note: { zh: '校优秀硕士学位；杭州研究院', en: 'Outstanding Master\'s Thesis; Hangzhou Institute' },
  },
  {
    name: '施浩远',
    cohort: '2023',
    note: { zh: '校优秀硕士学位、2025 年国家奖学金；杭州研究院', en: 'Outstanding Master\'s Thesis; 2025 National Scholarship; Hangzhou Institute' },
  },
];

/* ═══════════════════════════ 工具 ═══════════════════════════ */

/** 取姓名首字母 / 姓氏，用于生成占位头像 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  // 中文名取前两字，英文名取首尾首字母
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** 显示名：英文页面优先用 nameEn，没有就用中文名 */
export function displayName(person: Person, lang: 'zh' | 'en'): string {
  return lang === 'en' && person.nameEn ? person.nameEn : person.name;
}

/** 按年级从高到低分组；没有 cohort 的排到最后 */
export function groupByCohort(people: Person[]): Array<{ cohort: string; people: Person[] }> {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    const key = person.cohort ?? '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(person);
  }
  return [...map.entries()]
    .sort((a, b) => {
      if (a[0] === '') return 1;
      if (b[0] === '') return -1;
      return Number(b[0]) - Number(a[0]);
    })
    .map(([cohort, list]) => ({ cohort, people: list }));
}