/**
 * ★★★★★  实验室身份信息  ★★★★★
 *
 * 站点里所有"实验室自身"的信息都集中在这一个文件。
 * 换成你们实验室，只需要改这里 + src/data/ 下的四个数据文件，不用碰任何模板代码。
 *
 * 带 «占位» 注释的字段是等待你提供的，其余可以按需修改。
 */

import type { L } from '../i18n/ui';

export const site = {
  /* ─────────────────────────── 名称 ─────────────────────────── */
  /** 中文全称 */
  nameZh: '多维智能实验室',
  /** 英文全称 */
  nameEn: 'X-Dimensional Intelligence Lab',
  /** 缩写，用在页脚版权行 */
  abbr: 'XI-Lab',

  /* ────────────────────────── Slogan ────────────────────────── */
  sloganZh: '多维之间，智能之上',
  sloganEn: 'Beyond dimensions, beyond intelligence.',

  /* ─────────────────────────── 隶属 ─────────────────────────── */
  /** 页脚 / 关于我们里的隶属机构 */
  affiliationZh: '西安电子科技大学 · 通信工程学院',
  affiliationEn: 'Xidian University · School of Telecommunications Engineering',
  /** Hero 上那行橙色大写链接的文字 */
  heroLinkZh: '西安电子科技大学',
  heroLinkEn: 'XIDIAN UNIVERSITY',
  heroLinkUrl: 'https://www.xidian.edu.cn/',

  /* ───────────────────────── 关于我们 ───────────────────────── */
  /**
   * 首页「关于我们」正文，每段一条。
   *
   * 段落结构与措辞参照了同校 IIP 实验室主页的「About Us」写法：
   *   第 1 段：隶属机构 → 团队气质 → 负责人 → 规模 → 研究方向
   *   第 2 段：承担的项目 → 发表期刊与会议 → 专利
   *
   * 事实来源：杨曦老师官方主页（web.xidian.edu.cn/yangx）与人数字统计
   * （在读研究生 27 人见 src/data/people.ts；论文 100 余篇、专利 20 余项见老师主页）。
   * 如实验室有更正式的对外简介，直接替换这两段即可。
   */
  aboutZh: [
    '多维智能实验室（XI-Lab）依托西安电子科技大学通信工程学院与 ISN 国家重点实验室，是一支年轻、开放、富有活力的研究团队，由杨曦教授担任负责人，在读博士与硕士研究生 27 人。实验室聚焦人工智能前沿方向，围绕多源数据智能分析、四维场景生成理解、具身智能与智能体、遥感目标智能感知开展基础研究与关键技术攻关。',
    '团队成员主持或参与了国家自然科学基金、国家重点研发计划等多项科研项目，在 IEEE TPAMI、TIP、CVPR、ICCV、NeurIPS 等顶级期刊与会议发表论文 100 余篇，授权专利 20 余项。',
  ],
  aboutEn: [
    'The X-Dimensional Intelligence Lab (XI-Lab) is part of the School of Telecommunications Engineering and the State Key Laboratory of Integrated Services Networks (ISN) at Xidian University. It is a young, open and energetic research team directed by Professor Xi Yang, with 27 graduate students. The lab works on frontier problems in artificial intelligence, spanning intelligent analysis of multi-source data, 4D scene generation and understanding, embodied intelligence and agents, and intelligent perception of remote sensing targets.',
    'Members of the team have led or participated in research projects supported by the National Natural Science Foundation of China and the National Key R&D Program. They have published more than 100 papers in top journals and conferences such as IEEE TPAMI, TIP, CVPR, ICCV, NeurIPS, and hold more than 20 granted patents.',
  ],
  /**
   * 首页「关于我们」左侧 2×2 图片拼贴（4:3）。
   *
   * 四格**按顺序分别对应实验室的四个研究方向**，与研究方向页一致，
   * 四张图都来自 NASA 图片库（公有领域），出处见 public/img/about-CREDITS.md：
   *   第 1 格  多源数据智能分析   —— 韦德尔海三频假彩色 SAR（多波段合成 = 多源融合）
   *   第 2 格  四维场景生成理解   —— SIR-C 三维地形透视（带景深的三维场景）
   *   第 3 格  具身智能与智能体   —— Robonaut 2 人形机器人
   *   第 4 格  遥感目标智能感知   —— 轨道拍摄的沿海城市，港口/机场/农田等目标清晰
   *
   * 关于动态效果：早期第 1 格填了 `srcAlt`，把两张同机位影像交叉淡入淡出，用来表现
   * 「随时间变化」。现在四格各对应一个方向，凑不出同场景的两个状态，所以都是静态的。
   * **机制仍然保留**：给任意一格填上 `srcAlt`，`.collage-fade` 的交叉淡入就会自动生效
   * （实现见 src/styles/global.css）。
   */
  aboutImages: [
    {
      src: '/img/about-1.jpg',
      /** 第二张图。有值时两张交叉淡入淡出；没有则只显示 src（当前四格都没有） */
      srcAlt: null,
      altZh: '韦德尔海的三频假彩色合成孔径雷达影像，雷达波段合成的海冰与洋流纹理',
      altEn:
        'Three-frequency false-colour SAR image of the Weddell Sea, showing sea-ice floes and ocean-current textures',
    },
    {
      src: '/img/about-2.jpg',
      srcAlt: null,
      altZh: '由 SIR-C 雷达数据生成的三维地形透视图，加州 Mammoth 地区，可见山脊与湖泊的景深',
      altEn:
        'Three-dimensional perspective view of the Mammoth, California terrain generated from SIR-C radar data',
    },
    {
      src: '/img/about-3.jpg',
      srcAlt: null,
      altZh: '国际空间站舱内的 Robonaut 2 人形机器人，双臂展开',
      altEn: 'Robonaut 2 humanoid robot with arms outstretched aboard the International Space Station',
    },
    {
      src: '/img/about-4.jpg',
      srcAlt: null,
      altZh: '轨道拍摄的沿海城市白天光学影像，可见港口、机场跑道与农田',
      altEn:
        'Daylight orbital photograph of a coastal city, showing its harbour, airport runway and farmland',
    },
  ],

  /* ───────────────────────── 数字统计 ───────────────────────── */
  /**
   * 首页「关于我们」底部的两个大数字，value 会做滚动动画。
   *
   * 这两个数字要与事实对得上，改数据时记得同步：
   *   · 论文数 = Google Scholar 主页收录总数（2026-09 抓取为 152 条）
   *   · 研究生 = 在读博士生 + 在读硕士生（src/data/people.ts 里 7 + 20 = 27）
   * 改完可以跑 node _tools/verify-roster.mjs 复核。
   */
  stats: [
    {
      value: 152,
      suffix: '',
      labelZh: 'Google Scholar 收录',
      labelEn: 'On Google Scholar',
      subZh: '论文成果',
      subEn: 'PUBLICATIONS',
    },
    {
      value: 27,
      suffix: '',
      labelZh: '在读博士 / 硕士',
      labelEn: 'PhD / Master',
      subZh: '研究生',
      subEn: 'GRADUATE STUDENTS',
    },
  ],

  /* ───────────────────────── 招贤纳士 ───────────────────────── */
  joinUs: {
    /** 「加入我们」按钮指向的邮箱 */
    email: 'yangx@xidian.edu.cn',
    labelZh: '加入我们',
    labelEn: 'Join Us',
  },

/* ───────────────────────── 联系方式 ───────────────────────── */
  contact: {
    addressZh: ['陕西省西安市西沣路兴隆段 266 号'],
    addressEn: ['No. 266, Xinglong Section, Xifeng Road, Xi\'an, Shaanxi, China'],
    email: 'yangx@xidian.edu.cn',
    github: 'https://github.com/XI-Lab-XDU',
    /** 有微信公众号就填图片路径，没有就设为 null（页脚会隐藏该图标） */
    wechatQr: null as string | null,
  },

  /* ────────────────── 页脚「相关链接」（外链） ────────────────── */
  links: [
    { labelZh: 'ISN全国重点实验室', labelEn: 'ISN National Key Laboratory', url: 'https://isn.xidian.edu.cn/index.htm' },
    { labelZh: '通信工程学院', labelEn: 'School of Telecommunications Engineering', url: 'https://ste.xidian.edu.cn/' },
    { labelZh: '杭州研究院', labelEn: 'Hangzhou Research Institute', url: 'https://hz.xidian.edu.cn/' },
    { labelZh: 'XI-Lab GitHub', labelEn: 'XI-Lab on GitHub', url: 'https://github.com/XI-Lab-XDU' },
  ],

  /* ───────────────────────── 品牌资源 ───────────────────────── */
  assets: {
    /**
     * 导航栏 / 页脚用的 logo（透明底标志，由 XI-Lab_logo.pdf 最后一页提取）。
     * 原始矢量在 _logo/ 下，重新生成用：python _tools/extract-logo.py
     */
    logo: '/logo.png',
    /** 白底页面用的 logo（深色版）。标志本身是品牌蓝，深浅底都适用，所以留空 */
    logoDark: null as string | null,
    /** 浏览器标签页图标 */
    favicon: '/favicon.png',
    /** 社交分享预览图（1200×630，由 _tools/og-card.html 渲染生成） */
    ogImage: '/og-image.png',
    /**
     * logo 图片里是否已经包含实验室名称？
     * 提取出来的是纯标志（不含文字），所以这里保持 false，导航栏会显示完整名称。
     */
    logoIncludesName: false,
  },

  /* ───────────────────────── 页脚版权 ───────────────────────── */
  copyrightZh: '多维智能实验室（XI-Lab）',
  copyrightEn: 'X-Dimensional Intelligence Lab (XI-Lab)',
} as const;

/** 顶部导航项（顺序即显示顺序） */
export const navItems: ReadonlyArray<{ key: 'home' | 'team' | 'research' | 'publications'; href: string }> = [
  { key: 'home', href: '/' },
  { key: 'team', href: '/team/' },
  { key: 'research', href: '/research/' },
  { key: 'publications', href: '/publications/' },
];

/** 「关于我们」区块的小标题 */
export const aboutEyebrow: L = { zh: '关于我们', en: 'About Us' };