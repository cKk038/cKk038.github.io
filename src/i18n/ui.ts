/**
 * 双语支持
 *
 * 设计：UI 文案集中在本文件的 `ui` 对象；内容文案在 src/data/*.ts 里用 `L` 结构（{ zh, en }）内联。
 * 路由是独立的两套（`/` 中文、`/en/` 英文），不用 JavaScript 换字，对搜索引擎友好。
 */

export type Lang = 'zh' | 'en';

/** 一个中英双语的字符串 */
export type L = { zh: string; en: string };

export const languages: ReadonlyArray<{ code: Lang; label: string; htmlLang: string }> = [
  { code: 'zh', label: '中文', htmlLang: 'zh-CN' },
  { code: 'en', label: 'EN', htmlLang: 'en' },
];

/** 取双语字段的当前语言值 */
export function t(value: L, lang: Lang): string {
  return value[lang];
}

/** 取双语字段的另一种语言值（用于语言切换按钮的提示文字） */
export function other(value: L, lang: Lang): string {
  return value[lang === 'zh' ? 'en' : 'zh'];
}

/** 把中文路径转成目标语言路径：localizePath('/team/', 'en') → '/en/team/' */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'zh') return clean;
  return clean === '/' ? '/en/' : `/en${clean}`;
}

/** 从当前页面路径推断语言 */
export function langFromPath(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh';
}

/** 去掉语言前缀，拿到与语言无关的路径：'/en/team/' → '/team/' */
export function stripLang(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname;
}

/* ─────────────────────────── 界面文案 ─────────────────────────── */

export const ui = {
  /** 站点副标题，用在 <title> 与 meta description 里 */
  siteTagline: {
    zh: '聚焦多模态感知、生成与具身智能，研究智能体在多维信息空间中的理解、创造与行动',
    en: 'Multimodal perception, generation and embodied intelligence — understanding, creating and acting in multi-dimensional information spaces',
  },

  nav: {
    home: { zh: '首页', en: 'Home' },
    team: { zh: '团队', en: 'Team' },
    research: { zh: '研究', en: 'Research' },
    publications: { zh: '论文', en: 'Publications' },
  },

  /* ── 首页 Hero ── */
  hero: {
    welcome: { zh: '欢迎来到', en: 'Welcome to' },
    scrollHint: { zh: '向下滚动', en: 'Scroll' },
  },

  /* ── 首页 关于我们 ── */
  about: {
    /** 大标题默认用实验室英文/中文全称，这里只是兜底 */
    statsPublications: { zh: '论文', en: 'PUBLICATIONS' },
  },

  /* ── 首页 最新动态 ── */
  news: {
    eyebrow: { zh: '最新动态', en: 'Recent News' },
    heading: { zh: '最新动态', en: 'Recent News' },
    empty: { zh: '暂无动态。', en: 'No news yet.' },
    earlier: { zh: '查看往年动态', en: 'Earlier news' },
  },

  /* ── 团队页 ── */
  team: {
    pageTitle: { zh: '团队', en: 'Team' },
    eyebrow: { zh: '团队成员', en: 'Team Members' },
    intro: {
      zh: '我们是一支年轻、开放、充满活力的研究团队。',
      en: 'We are a young, open and energetic research team.',
    },
    groups: {
      faculty: { zh: '教师', en: 'Academic Staff' },
      students: { zh: '在读学生', en: 'Students' },
      alumni: { zh: '毕业校友', en: 'Alumni' },
      phd: { zh: '博士研究生', en: 'Ph.D. Candidates' },
      master: { zh: '硕士研究生', en: 'Master Students' },
      alumniPhd: { zh: '毕业博士', en: 'Alumni · Ph.D.' },
      alumniMaster: { zh: '毕业硕士', en: 'Alumni · Master' },
    },
  },

  /* ── 研究页 ── */
  research: {
    pageTitle: { zh: '研究', en: 'Research' },
    eyebrow: { zh: '研究方向', en: 'Research' },
    heading: { zh: '研究方向', en: 'Research Topics' },
    intro: {
      zh: '我们围绕以下方向开展基础研究与关键技术攻关。',
      en: 'We conduct fundamental research and key technology development in the following areas.',
    },
    selectedPublications: { zh: '代表性论文', en: 'Selected Publications' },
    viewAll: { zh: '查看全部论文', en: 'View all publications' },
    /** 配图（论文框架图）的图注与操作提示 */
    figureFrom: { zh: '框架图出自', en: 'Framework figure from' },
    viewFull: { zh: '查看大图', en: 'View full size' },
  },

  /* ── 论文页 ── */
  publications: {
    pageTitle: { zh: '论文', en: 'Publications' },
    eyebrow: { zh: '论文成果', en: 'Publications' },
    heading: { zh: '论文成果', en: 'Publications' },
    intro: {
      zh: '完整论文列表，按年份分组。',
      en: 'Complete publication list, grouped by year.',
    },
    filterAll: { zh: '全部', en: 'All' },
    filterLabel: { zh: '按方向筛选', en: 'Filter by topic' },
    empty: { zh: '暂无论文。', en: 'No publications yet.' },
    /** 论文条目里的链接按钮文字 */
    linkLabels: {
      pdf: { zh: 'PDF', en: 'PDF' },
      doi: { zh: 'DOI', en: 'DOI' },
      code: { zh: '代码', en: 'Code' },
      project: { zh: '主页', en: 'Project' },
      arxiv: { zh: 'arXiv', en: 'arXiv' },
      scholar: { zh: '学术', en: 'Scholar' },
    },
  },

  /* ── 页脚 ── */
  footer: {
    laboratory: { zh: '实验室', en: 'Laboratory' },
    contact: { zh: '联系方式', en: 'Contact' },
    links: { zh: '相关链接', en: 'Links' },
    pages: { zh: '页面', en: 'Pages' },
    aboutUs: { zh: '关于我们', en: 'About Us' },
    teamMembers: { zh: '团队成员', en: 'Team Members' },
    researchTopics: { zh: '研究方向', en: 'Research Topics' },
    allPublications: { zh: '全部论文', en: 'Publications' },
    rights: { zh: '版权所有', en: 'All Rights Reserved' },
    /** 「本站点由 … 构建」——想隐藏就把 hasBuiltWith 设为 false */
    builtWith: { zh: '使用 Astro 构建', en: 'Built with Astro' },
    hasBuiltWith: true,
  },

  /* ── 通用 ── */
  common: {
    backToTop: { zh: '回到顶部', en: 'Back to top' },
    breadcrumbHome: { zh: '首页', en: 'Home' },
    languageSwitch: { zh: '切换到英文', en: 'Switch to Chinese' },
    openMenu: { zh: '打开菜单', en: 'Open menu' },
  },
} as const;

export type Ui = typeof ui;