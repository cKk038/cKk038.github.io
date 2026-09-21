/**
 * 最新动态（首页展示）
 *
 * ⚠️ 目前是**空列表**：实验室暂时没有提供动态内容，所以首页的「最新动态」区块会自动隐藏。
 *
 * 之前这里是参考站点的示例文案（里面的人是别的实验室的学生），已经全部删除 ——
 * 实验室主页上挂着别组的名字比留空糟糕得多。
 *
 * ── 怎么写一条动态 ──────────────────────────────────────────
 *   { date: '2026-06-15', text: { zh: '…', en: '…' } },
 *
 * · date 用 ISO 格式（YYYY-MM-DD），用于排序，不会直接显示；显示时会自动变成
 *   「2026年6月」/「Jun. 2026」。
 * · 想高亮某个人名，用双方括号包起来：'…论文被 CVPR 2026 接收，作者为 [[段松松]]。'
 *   渲染出来就是参考站点里那种高亮小块。
 * · 英文写不出来可以留空字符串 ''，页面会回退显示中文。
 *
 * ── 可以直接从团队页拿到的素材 ──────────────────────────────
 * src/data/people.ts 的 note 里已经记录了每位学生的获奖与毕业年份，例如
 * 2025 年国家奖学金（段松松、李鹏辉、董文妍、顾续、孙嘉辰、施浩远）、
 * 魏梓钰 2023 年 6 月毕业、余颖 2023 年 12 月毕业等，都可以整理成动态条目。
 */

import type { L } from '../i18n/ui';

export interface NewsItem {
  /** ISO 日期 YYYY-MM-DD */
  date: string;
  /** 正文。人名用 [[名字]] 包裹即可高亮 */
  text: L;
  /** 可选：外部链接（如论文页、新闻报道） */
  url?: string;
}

export const news: NewsItem[] = [
  // ← 有了真实动态就按上面的格式加在这里，首页区块会自动出现
];

/* ─────────────────────────── 工具函数 ─────────────────────────── */

/** 按年份倒序分组，年份内按日期倒序 */
export function groupNewsByYear(items: NewsItem[] = news): Array<{ year: number; items: NewsItem[] }> {
  const byYear = new Map<number, NewsItem[]>();
  for (const item of items) {
    const year = Number(item.date.slice(0, 4));
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(item);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({
      year,
      items: [...list].sort((a, b) => b.date.localeCompare(a.date)),
    }));
}

const EN_MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

/** '2026-06-15' → 「2026年6月」 / 'Jun. 2026' */
export function formatNewsDate(iso: string, lang: 'zh' | 'en'): string {
  const year = iso.slice(0, 4);
  const month = Number(iso.slice(5, 7));
  if (lang === 'zh') return `${year}年${month}月`;
  return `${EN_MONTHS[month - 1]} ${year}`;
}