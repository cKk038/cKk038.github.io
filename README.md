# 实验室主页

> **多维之间，智能之上**
> **Beyond dimensions, beyond intelligence.**

参考 [IIP-XDU Lab](https://iip-xdu.github.io/) 的结构与视觉语言构建，技术上做了一轮升级：
去掉 jQuery / Owl Carousel / WOW.js / CounterUp 四个前端依赖，改用原生 JavaScript；
内容与模板彻底分离，改内容只需要编辑数据文件，不用碰 HTML 结构。

---

## 目录

- [一分钟上手](#一分钟上手)
- [我需要改哪些文件](#我需要改哪些文件)
  - [1. 实验室基本信息](#1-实验室基本信息-srcconfigsitets)
  - [2. 最新动态](#2-最新动态-srcatanewssts)
  - [3. 团队成员](#3-团队成员-srcdatapeoplests)
  - [4. 研究方向](#4-研究方向-srcdataresearchts)
  - [5. 论文](#5-论文-srcdata publicationsts)
  - [6. 换 logo 和图片](#6-换-logo-和图片)
- [文案里怎么高亮人名](#文案里怎么高亮人名)
- [中英文双语](#中英文双语)
- [部署到 GitHub Pages](#部署到-github-pages)
- [本地开发](#本地开发)
- [技术栈与设计说明](#技术栈与设计说明)

---

## 一分钟上手

```bash
npm install     # 安装依赖（第一次需要）
npm run dev     # 本地预览，打开 http://localhost:4321
npm run build   # 构建静态站点到 dist/
```

改内容 → 存盘 → 浏览器自动刷新。满意后推送到 GitHub，站点会自动更新。

---

## 我需要改哪些文件

**所有需要改的内容都在下面这 6 个地方**，其余文件都是模板，不用动。

### 1. 实验室基本信息 `src/config/site.ts`

这是最核心的文件。实验室名称、slogan、隶属机构、地址、邮箱、GitHub 组织、
页脚友情链接、首页统计数字都集中在这里。

文件里带 `«占位»` 标记的字段是**目前用的占位内容，需要替换成你们实验室的真实信息**：

```ts
nameZh: '多维智能实验室',                    // 已确认
nameEn: 'X-Dimensional Intelligence Lab',   // 已确认
abbr: 'XI-Lab',                             // 已确认
affiliationZh: '西安电子科技大学 · 通信工程学院',   // 已确认
heroLinkZh: '西安电子科技大学',                    // 已确认
heroLinkUrl: 'https://www.xidian.edu.cn/',
contact: {
  addressZh: ['陕西省西安市西沣路兴隆段 266 号'],
  email: 'yangx@xidian.edu.cn',
  github: 'https://github.com/XI-Lab-XDU',
},
```

目前仍标着 `«占位»` 的只有中英文「关于我们」的第 2 段，等实验室提供正式简介后替换。

其他几个字段：

| 字段 | 作用 |
|---|---|
| `sloganZh` / `sloganEn` | 首页 Hero 上的大标语 |
| `aboutZh` / `aboutEn` | 首页「关于我们」的正文，数组的每一项是一个段落 |
| `aboutImages` | 首页左侧 2×2 图片拼贴，放 `public/img/` 下 |
| `stats` | 首页的两个大数字（会自动做滚动动画） |
| `joinUs.email` | 「加入我们」按钮指向的邮箱 |
| `links` | 页脚「相关链接」栏 |
| `assets.logoIncludesName` | 如果你的 logo 图片里已经包含实验室名称，设为 `true`，导航栏就不重复显示文字 |

> 站点副标题（出现在浏览器标签页）在 `src/i18n/ui.ts` 的 `siteTagline`。

### 2. 最新动态 `src/data/news.ts`

```ts
{
  date: '2026-06-20',            // ISO 格式，用于排序；显示时会自动变成「2026年6月」/「Jun. 2026」
  text: {
    zh: '五篇论文被 ECCV 2026 接收。第一作者：[[Nuoyan Zhou]]、[[Pengyu Chen]]。',
    en: 'Five papers accepted by ECCV 2026. Lead authors: [[Nuoyan Zhou]], [[Pengyu Chen]].',
  },
  url: 'https://...',            // 可选：点进去看详情
},
```

一条动态就是一个对象，直接往数组里加即可。首页只默认展开最新一年，
往年动态会收进「查看往年动态」里，不会把页面撑得很长。

### 3. 团队成员 `src/data/people.ts`

**数据来源：杨曦老师官方主页的「科研团队」栏目**
（https://web.xidian.edu.cn/yangx/team.html），当前共 63 人。
更新日期：2026-09-21。

分五个数组，各自对应团队页的一个小节：

| 数组 | 显示位置 | 当前人数 |
|---|---|---|
| `faculty` | 教师 | 1（杨曦） |
| `phdStudents` | 博士研究生 | 7 |
| `masterStudents` | 硕士研究生 | 20 |
| `alumniPhd` | 毕业博士 | 2 |
| `alumniMaster` | 毕业硕士 | 34 |

**教师**：填了 `bio` 的会渲染成左图右文的「负责人详情区」（能放下完整简介、荣誉、
学术兼职），没填 `bio` 的走网格卡片。所以以后加入新老师，不加 `bio` 就会自动
出现在网格里，不用改代码。

```ts
{
  name: '杨曦',
  nameEn: 'Xi Yang',                    // 可选；英文页面优先显示它
  role: { zh: '教授 · 华山特聘 · 博士生导师', en: 'Professor · …' },
  photo: '/img/people/yang-xi.jpg',
  email: 'yangx@xidian.edu.cn',
  url: 'https://web.xidian.edu.cn/yangx/index.html',
  interests: { zh: '…', en: '…' },
  bio: [{ zh: '第一段', en: '…' }],      // 有 bio → 渲染成详情区
  honors: [{ zh: '…', en: '…' }],        // 荣誉奖励与学术兼职
},
```

**学生 / 校友**：只需要姓名与年级，`note` 里放获奖和去向。

```ts
{ name: '段松松', cohort: '2023',
  note: { zh: '校优秀博士学位论文资助、2025 年国家奖学金', en: '…' } },
```

- `cohort` 是年级，团队页会**按年级从高到低分组**显示并加上「2023 级 / Class of 2023」小标题。
- `nameEn` 不给的话，英文页面也显示中文名 —— 中国人的姓名本来不需要翻译，
  想给拼音就补上 `nameEn`（现在只有杨老师填了）。
- 某个数组清空后对应小节会自动隐藏，不会留空标题。

### 4. 研究方向 `src/data/research.ts`

四个方向与实验室官方主页上的「主要研究方向」一致（2026-09 更新）：

1. **多源数据智能分析** / Intelligent Analysis of Multi-Source Data
2. **四维场景生成理解** / 4D Scene Generation and Understanding
3. **具身智能与智能体** / Embodied Intelligence and Agents
4. **遥感目标智能感知** / Intelligent Perception of Remote Sensing Targets

```ts
{
  id: 'multi-source',                   // 唯一 id
  title: { zh: '多源数据智能分析', en: 'Intelligent Analysis of Multi-Source Data' },
  summary: { zh: '一句话简介', en: 'One-line summary' },
  points: [                             // 卡片上的圆点列表（子方向）
    { zh: '跨模态特征对齐与融合', en: 'Cross-modal feature alignment and fusion' },
  ],
  icon: 'bi-diagram-3',                 // Bootstrap Icons 图标名
  image: '/img/research/multi-source.png',   // 论文框架图；不给则只显示图标与文字
  paper: {                              // 图注里标出的论文出处（CC BY 要求署名）
    title: '…', venue: '…', url: '…',
  },
},
```

#### 配图由脚本处理，素材是实验室论文里的框架图

**不是自绘示意图**，而是从实验室代表性论文里取的 framework 图，脚本只做裁剪白边、
缩放、压缩，并生成版权说明：

```bash
node _tools/fetch-paper-figs.mjs        # 下载 MDPI 论文插图（按文章号拼 URL）
python _tools/build-research-figures.py # 裁白边、缩放、写 research-CREDITS.md
```

| 方向 | 依据论文 | 图 | 许可 |
|---|---|---|---|
| 多源数据智能分析 | *Lightweight RGB-D Salient Object Detection* (IEEE TIP 2025) | arXiv 版 Fig. 2 | **CC BY-NC-SA 4.0** ⚠️ |
| 四维场景生成理解 | *3D Point Cloud Shape Generation with Collaborative Learning of GAN and Auto-Encoder* (Remote Sensing 2024) | Fig. 2 | CC BY 4.0 |
| 具身智能与智能体 | *Adaptive Granularity-Fused Keypoint Detection for 6D Pose Estimation of Space Targets* (Remote Sensing 2024) | Fig. 2 | CC BY 4.0 |
| 遥感目标智能感知 | *Coastal Ship Tracking with Memory-Guided Perceptual Network* (Remote Sensing 2023) | Fig. 2 | CC BY 4.0 |

**三篇 MDPI《Remote Sensing》是 CC BY 4.0 开放获取，署名即可自由使用。**
第 ① 篇用的是 arXiv 版本，许可是 **CC BY-NC-SA 4.0**（允许非商业使用 + 署名 +
相同方式共享）—— 实验室主页属非商业用途，符合要求，但**更稳妥的做法是换成
IEEE TIP 正式版插图**（作者本人对自己论文的插图通常有使用权）。详见
[`public/img/research/research-CREDITS.md`](public/img/research/research-CREDITS.md)。

因为论文插图里的字很密，缩到卡片宽度后读不清，所以**图片整块做成了链接，
点开看原图**；卡片底部的图注也会标出论文出处（CC BY 的署名要求）。

> ⚠️ `points`（子方向条目）是按方向内涵整理的，**请实验室确认表述是否准确**。
> 想换成别的论文插图：把新图放到 `public/img/research/<方向id>.png` 覆盖即可，
> 代码不用动（`research.ts` 里的 `image` 字段指向这些文件名）。

### 5. 论文 `src/data/publications.ts`

**目前是 2022 年至今的 102 篇，全部从杨曦老师的 Google Scholar 主页导入**，
作者顺序、标题、年份都保持 Google Scholar 原文，没有做任何改写。

**要更新论文列表时：**

1. 打开 [Google Scholar 主页](https://scholar.google.com/citations?user=W5c-LSYAAAAJ)，
   用页面上的「显示更多」把列表展开完整（默认只显示 20 条，要点到按钮消失为止）。
2. 让页面内容自动抓取到 `_tools/scholar-raw.json`。抓取逻辑是浏览器里的一段脚本
   （读 `#gsc_a_b .gsc_a_tr` 的行，取标题 / 作者 / 期刊 / 年份 / 引用链接），
   换机器时按同样结构重新取一次即可。
3. 运行导入：

   ```bash
   node _tools/import-scholar.mjs
   ```

导入脚本只做两件**规范化**的事，都会打印报告供核对：

| 处理 | 说明 |
|---|---|
| 清洗 venue | 去掉 Google Scholar 列表里附带的年份/卷号/期号/页码，只留期刊或会议本名。**不改写名字本身**，只修补 Google Scholar 显示不全导致的截断 |
| 去重 | 同一篇论文 Google Scholar 有时同时收录中英文两条记录（卷期页完全相同），只保留一条。判定条件很严（年份+卷期页相同 **且** 一条含中文另一条纯英文 **且** 作者人数相同），宁肯留着重复也不误删真论文 |

> ⚠️ **导入脚本会覆盖 `selected` 标记**（它按被引次数猜 8 篇）。跑完导入后，
> 代表性论文需要按下面「代表性论文」一节的方法改回来。

### 代表性论文（`selected`）

**由实验室提供的《Selected Publications》清单人工确定，共 10 篇**，不是按被引次数
自动挑的。清单是根目录下的 `Selected Publications.docx`，用这个脚本读出来：

```bash
python _tools/extract-docx.py "Selected Publications.docx"          # 看纯文本
python _tools/extract-docx.py "Selected Publications.docx" --json   # 输出 JSON 便于比对
```

改 `src/data/publications.ts` 时注意两点：

- **只改 `selected` 这一个字段**，其余 92 条论文的作者/标题保持 Google Scholar 原文不动。
- 这 10 篇的作者写的是**完整姓名**（如 `Xi Yang, Nannan Wang`），其余条目是
  Scholar 的缩写形式（`X Yang, N Wang`）—— 因为清单里就是完整姓名，如实照录。

引用格式已按规范校对过，docx 原件里这几处是错的，别照抄回去：

| 原件写法 | 问题 | 改法 |
|---|---|---|
| `Xi Yang (杨 曦)*` | 中文名中间多一个空格；`*`（通讯作者）、`#`（共同一作）角标没有图例说明 | 去掉中文名与角标，直接写 `Xi Yang` |
| `IEEE International Conference on Computer Vision (ICCV)` | 正式名称漏了 `/CVF` | `IEEE/CVF International Conference on Computer Vision (ICCV)` |
| `𝒟ℐℋ-CLIP` | 花体字符，检索和渲染都不可靠 | 写成 `DIH-CLIP` |
| `2025. 11 Jun-15 Jun, Nashville, TN, USA.(Highlight)` | 会议日期/城市不属于引用；`(Highlight)` 前缺空格 | 一并删除（站点引用格式为「作者: 标题. 期刊, 年份.」） |
| `https://github.com/code/FANet` | 经 GitHub API 核实**仓库不存在（404）** | 不收录该链接 |

（其余 5 个代码仓库链接都核实过真实存在，已作为 `links` 里的 `code` 按钮收录。）

> 论文页**只按年份分组展示，不做方向分类** —— 曾经有一套按关键词把论文归入研究方向的
> `topic` 字段和「按方向筛选」按钮，已按要求移除，数据里的 `topic` 也一并清掉了。
> 如果以后想恢复筛选，删掉的规则逻辑在 `import-scholar.mjs` 里有说明。

手动新增一条的格式：

```ts
{
  authors: 'X Yang, Y Zhang, Q Tian',   // 按原文顺序；实验室成员可用 [[X Yang]] 高亮
  title: 'Exact title as published',
  venue: 'IEEE TPAMI',                  // 期刊/会议名，会加粗
  year: 2026,
  selected: true,                       // 标为「代表性论文」，会出现在研究页
  links: [{ kind: 'scholar', url: 'https://scholar.google.com/…' }],
},
```

- `links[].kind` 取值：`pdf` | `doi` | `code` | `project` | `arxiv` | `scholar`
  （按钮文字在 `src/i18n/ui.ts` 里改）。导入时会自动给每条加上 Scholar 链接，
  这样列表里每篇论文都能追溯到出处。
- 论文页会**按年份自动分组**，不需要手动排序。
- 研究页展示**全部**标了 `selected` 的论文（不再写死数量）。
- 展示范围由 `MIN_YEAR`（默认 2022）控制。

### 6. 换 logo 和图片

**Logo 是从 `docs/brand/XI-Lab_logo.pdf` 自动提取的**，不是手绘的占位图：

| 文件 | 来源 | 用途 |
|---|---|---|
| `public/logo.png` | 自动提取，透明底 | 导航栏 / 页脚（512×512） |
| `public/favicon.png` | 自动提取，深色圆角方块 | 浏览器标签页（256×256） |
| `public/apple-touch-icon.png` | 自动提取 | iOS 加到主屏的图标（180×180） |
| `public/og-image.png` | 由 `/og-card/` 页面渲染 | 社交分享预览图（1200×630） |
| `public/img/brand-mark.png` | 自动提取，纯标志大图 | 以后做海报等物料用（1291×1152） |

**换了 logo 之后重新生成：**

```bash
python _tools/extract-logo.py      # 重新从 PDF 提取 logo / favicon / 图标
python _tools/optimize-og.py       # 生成完分享图后压一次体积（可选）
```

`extract-logo.py` 只依赖 `pdftocairo`（MiKTeX / TeX Live / Poppler 自带）
和 Python 的 Pillow + numpy。它会自动把 PDF 里最后一页的标志抠成透明底 ——
原理是标志是扁平色画在扁平底上，所以能用绿色通道当 alpha 键再反预乘回去，
边缘比阈值抠图干净。裁剪区域等参数写在脚本开头的注释里。

**分享图怎么重新生成：** 打开站点的 `/og-card/` 页面（一个 noindex 的内部页面，
专门用来渲染分享图），把浏览器窗口设成 **1200×630**，截图另存为
`public/og-image.png` 即可。做成页面而不是死图片，是为了改名后不用找人重做。

**其余配图**（同名覆盖即可，代码不用动）：

| 文件 | 用途 | 建议尺寸 |
|---|---|---|
| `public/img/about-1a.jpg` + `about-1b.jpg` | 首页拼贴第 1 格，两张交叉淡入 | 4:3，640×480 |
| `public/img/about-2.jpg` … `about-4.jpg` | 首页拼贴其余三格 | 4:3，640×480 |
| `public/img/research/*.svg` | 研究方向配图（论文风格示意图） | 4:3，800×600 |
| `public/img/people/*.jpg` | 教师头像 | 3:4 竖版最佳 |

### 首页拼贴的图从哪来

**四格分别对应实验室的四个研究方向**，全部来自 NASA 图片库、属于公有领域
（美国联邦政府作品），可自由使用与再分发。出处、NASA ID、说明页链接都记录在
[`public/img/about-CREDITS.md`](public/img/about-CREDITS.md)（由脚本自动生成）。

| 格 | 对应方向 | 影像 |
|---|---|---|
| 1 | **四维场景生成理解** | 拉斯维加斯 1984 / 2010 两期 Landsat 影像（**交叉淡入的动态效果**），同一场景随时间的演化 |
| 2 | **多源数据智能分析** | 荷兰 Flevoland 三频（X/C/L 波段）假彩色 SAR，三个频段合成 |
| 3 | **具身智能与智能体** | 国际空间站上的 Robonaut 2 人形机器人 |
| 4 | **遥感目标智能感知** | 东京与东京湾的 Landsat 影像，城市与港口设施清晰可辨 |

重新生成：

```bash
node _tools/fetch-candidates.mjs     # 从 NASA 下载原始素材到 _candidates/
python _tools/build-about-images.py  # 裁成 4:3、压缩、加年份角标
```

裁切参数写在 `build-about-images.py` 的 `STATIC` 列表里 —— 原图有带元数据条的
（Flevoland 顶部一整条）、有上下两期对照的（拉斯维加斯、东京），所以用显式裁切框
而不是自动居中裁。

**第 1 格的「动态图」是怎么做的**：不是 GIF 也不是动态 WebP，而是**两张同机位
JPEG + CSS 交叉淡入淡出**（`global.css` 里的 `.collage-fade` 与 `@keyframes collageFade`）。
这样同样效果体积小 5 倍（341 KB vs 593 KB），过渡更平滑，而且能跟随系统的
「减少动态效果」设置自动静止成一张。想换成别的对比图，只要
`src/config/site.ts` 里 `aboutImages[0]` 同时填 `src` 和 `srcAlt` 即可。

---

## 文案里怎么高亮人名

在新闻、论文作者里，用**双方括号**包住的名字会渲染成参考站点那种橙色高亮小块：

```ts
zh: '五篇论文被 ECCV 2026 接收，第一作者：[[Nuoyan Zhou]] 和 [[Pengyu Chen]]。'
```

效果：<span style="color:#B45309;background:rgba(254,161,22,.16);padding:0 3px;border-radius:3px">Nuoyan Zhou</span>

这个小细节能让「谁发了论文」一眼可见，是参考站点最值得借鉴的处理。

---

## 中英文双语

- 中文在 `/`、`/team/`、`/research/`、`/publications/`
- 英文在 `/en/`、`/en/team/`、`/en/research/`、`/en/publications/`
- 右上角橙色按钮一键切换，**是两套独立路由**（不是 JS 换字），对搜索引擎友好，
  并且带 `hreflang` 互相标注。
- 另外还有一个 `/og-card/`：渲染社交分享图的内部页面，带 `noindex`，
  不出现在导航和 sitemap 里。

内容字段用 `{ zh: '…', en: '…' }` 结构。**英文懒得写就填空字符串 `''`，页面会自动回退显示中文**，
不会出现空白。界面上的按钮、标题等文案统一在 `src/i18n/ui.ts` 里改。

---

## 部署到 GitHub Pages

站点是纯静态的（`npm run build` 产出 `dist/`，没有任何服务端逻辑），
用 GitHub Pages 托管**完全免费**，不需要服务器，仓库公开或私有都行。
构建发布的工作流已经写好放在 `.github/workflows/deploy.yml`，推送到 `main` 分支就自动跑。

### 一次性设置（约 3 分钟）

当前部署在**个人账户的用户站**（`astro.config.mjs` 里 `site: 'https://ckk038.github.io'`，没有 `base`），
所以仓库名必须是 **`<你的用户名>.github.io`**。GitHub 就是靠这个特殊仓库名
决定站点挂在根路径还是子路径的，名字不对会白屏。

1. 在个人账户下新建仓库，名字填 `<你的用户名>.github.io`，公开或私有都行。
   **不要**勾选 "Add a README file"，否则第一次推送会因为远程有本地没有的提交而被拒。
2. 本地关联远程并推送：

   ```bash
   git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
   git branch -M main
   git push -u origin main
   ```

3. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
   （不要选 "Deploy from a branch"——那条路不会跑我们写的构建流程。）
4. 等一两分钟，点开仓库的 **Actions** 标签页，看到绿色对勾就发布好了，
   地址是 `https://<你的用户名>.github.io`。

之后就一劳永逸了：**每次 `git push` 到 `main`，GitHub 自动重新构建并发布**，不用手动做任何事。
在 Actions 页面点 *Run workflow* 也可以手动触发一次部署。

### 想换地址怎么办

| 目标地址 | 要改的地方 |
|---|---|
| 个人用户站 `https://<用户名>.github.io`（当前） | 仓库名对上即可，不用改代码 |
| 组织站 `https://<组织名>.github.io` | 改 `astro.config.mjs` 的 `site`、`public/robots.txt` 里的 Sitemap、`git remote`，仓库名改成 `<组织名>.github.io` |
| 子路径项目站 `https://<用户名>.github.io/homepage` | 要改**代码**，见下 |
| 自有域名 `https://lab.example.edu.cn` | 改 `site`；仓库 **Settings → Pages → Custom domain** 填域名；域名商那边加 CNAME 记录 |

**换成子路径项目站不能只加 `base`。** 实测过（构建了一份带 `base` 的产物来比对）：
Astro 只会自动给自己打包的 `_astro/…` 资源加前缀，而本站的导航链接走
`localizePath()`、图片是 `/img/…` 这类写死的绝对路径，**都不会自动加前缀**，
结果就是全部 404、页面白屏。真要改成项目站，得同时改 `src/i18n/ui.ts` 里的
`localizePath()` 和所有资源引用，让它们拼上 `import.meta.env.BASE_URL`。
所以除非有特别理由，用根路径的用户站/组织站最省事。

### 推送前先自检

```bash
npm run build
node _tools/check-deploy.mjs
```

这个脚本专门抓「本地能跑、推上去就坏」的问题：

- 每一处资源引用在 `public/` 下是否真的存在；
- **大小写是否与磁盘完全一致** —— GitHub Actions 跑在 Linux 上，文件名大小写敏感；
  Windows 本地不区分大小写，代码里写错大小写照样能跑，云端会直接 404；
- `site` / `base` 与 `public/robots.txt` 里的 Sitemap 地址是否自洽；
- `package.json` 与 `package-lock.json` 是否同步（CI 用 `npm ci`，不同步会直接失败）；
- **lockfile 里的下载地址有没有指向国内镜像**（见下面的坑）；
- `dist/` 产物里的引用能不能对上实际文件。

### 常见坑

- **第一次推送就失败，报 `Get Pages site failed` 或 `Not Found`** → 顺序反了。
  必须先在 **Settings → Pages → Source** 选中 **GitHub Actions**，再推送（或推送失败后去开，
  然后到 Actions 页面点 **Re-run all jobs** 重跑一次即可，不用改任何代码）。
- **推送后 Actions 报错、但本地 `npm run build` 正常** → 先跑 `node _tools/check-deploy.mjs`，
  它会检查大小写、锁文件同步、下载源这三类「本地正常云端失败」的经典原因。
- **CI 卡在「安装依赖」那一步、一两秒就失败，本地却完全正常** → 这个坑真踩过一次，原因不好找，
  完整记在这里免得再犯。

  **现象**：`npm ci` 在 Linux 构建机上 1 秒内报 `EUSAGE` 并列出
  `Missing: @emnapi/runtime@1.11.3 from lock file`，而同一份 lockfile 在 Windows 本地
  `npm ci` 完全正常。

  **原因**：`npm ci` 会严格校验 lockfile 与 package.json 严丝合缝，缺任何一个包就直接退出。
  这份 lockfile 是在 Windows 上生成的，**没有记录只有 Linux 才需要的 wasm32 平台变体依赖**
  （`@emnapi/runtime`、`@emnapi/core`，来自 `sharp` 和 Vite 的 wasm 回退包）。
  那些包在 Windows 上根本不会被安装，所以 npm 生成 lockfile 时就没解析它们。

  **为什么补不齐**：在 Windows 上重新生成 lockfile、加 `--os=linux --cpu=x64` 都试过，
  反而会丢掉别的条目、缺得更多。跨平台的依赖闭包在单平台上生成不出来。

  **解法**：工作流里的安装步骤用 `npm install` 而不是 `npm ci`。
  `npm install` 会在目标平台上把缺口自己补齐，这正是这种情况的标准解法。
  **别把它改回 `npm ci`** —— 注释里也写了原因。

  **以后怎么快速定位**：工作流的安装/构建步骤会把报错逐行输出成 GitHub 的「注解」，
  注解对公开仓库匿名可读（日志正文需要管理员权限）。直接跑：

  ```bash
  node _tools/fetch-ci-log.mjs cKk038 cKk038.github.io
  ```

  它会列出最近几次运行、失败在哪一步、以及注解里的原始报错。
- **页面样式全丢、控制台一堆 404** → 资源路径少了或多了前缀。
  根路径部署（用户站/组织站）不该有 `base`，子路径项目站必须有 `base` 且代码要跟着改（见上）。
- **改了内容推上去，网站还是旧的** → 先看 Actions 有没有跑完；再确认改的文件真的提交了
  （`git status`），以及浏览器强刷（Ctrl+F5，静态资源有缓存）。
- **部署方式选了 "Deploy from a branch"** → 换回 **GitHub Actions**。
  顺带说明：`public/.nojekyll` 这个文件只有在「分支部署」方式下才起作用
  （Jekyll 会忽略下划线开头的目录，而 Astro 的资源目录叫 `_astro/`）；
  走 GitHub Actions 时 Jekyll 根本不参与，留着它只是为了将来万一换回分支部署。
  **别删。**

---

## 本地开发

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器，支持热更新 → http://localhost:4321
npm run build        # 构建到 dist/
npm run preview      # 本地预览构建产物（发布前建议跑一次）

# 辅助脚本（一般不需要跑）
python _tools/extract-logo.py        # 从 docs/brand/XI-Lab_logo.pdf 重新提取 logo
node   _tools/fetch-paper-figs.mjs     # 下载 MDPI 论文的框架图（方向配图素材）
python _tools/build-research-figures.py # 裁白边、缩放、写研究配图版权说明
node   _tools/fetch-candidates.mjs   # 从 NASA 重新下载首页配图素材
python _tools/build-about-images.py  # 重新生成首页拼贴（含动态效果的两张）
node   _tools/import-scholar.mjs     # 从 Google Scholar 抓取结果导入论文
python _tools/optimize-og.py         # 压缩分享图
node   _tools/check-seo.mjs          # 检查各页 title / canonical / hreflang
node   _tools/verify-roster.mjs      # 核对团队名单与年级分组
node   _tools/verify-publications.mjs  # 核对论文数据完整性
node   _tools/verify-output.mjs      # 检查产物里有没有残留的占位内容
node   _tools/check-freshness.mjs    # 检查 dist/ 是不是比 src/ 旧（推送前跑一次）
node   _tools/check-deploy.mjs       # 部署前自检：资源路径、大小写、site 配置、依赖源
node   _tools/fix-lockfile-registry.mjs  # 把 lockfile 的下载地址从国内镜像换成官方源
node   _tools/fetch-ci-log.mjs       # 查看 GitHub Actions 最近一次运行的失败步骤
python _tools/extract-docx.py        # 读 Selected Publications.docx（代表性论文清单）
```

要求 Node.js ≥ 20。辅助脚本需要 Python 3 + Pillow + numpy
（提取 logo 还要 `pdftocairo`；下载 NASA 素材需要联网）。

### ⚠️ 改完内容刷新看不到变化？多半是跑错了服务器

`npm run dev` 和 `npm run preview` **都占用 4321 端口，但行为完全不同**：

| 命令 | 服务的是 | 改了 `src/` 下的文件后 |
|---|---|---|
| `npm run dev` | **源文件**，带热更新 | 存盘即生效，浏览器自动刷新 —— **改内容时用这个** |
| `npm run preview` | 构建产物 `dist/` | **不会变**，必须先 `npm run build` 重新构建 |

`preview` 是用来「发布前确认产物」的，它读的是 `dist/` 里的静态文件。
内容还在来回改的阶段请用 `npm run dev`。

准备推送部署前，可以跑一次 `node _tools/check-freshness.mjs` ——
它会对比 `src/` 与 `dist/` 的修改时间，并检查构建产物里有没有包含最新文案。

---

## 技术栈与设计说明

### 技术栈

| 项 | 说明 |
|---|---|
| 框架 | [Astro](https://astro.build) 7 —— **构建产物是纯静态 HTML**，没有框架运行时，随时能退回手写 HTML |
| 样式 | Bootstrap 5.3（栅格与工具类）+ 自写 CSS（设计令牌与组件） |
| 字体 | Nunito（自托管，`@fontsource/nunito`）+ 系统中文字体栈 |
| 图标 | Bootstrap Icons（自托管） |
| 前端交互 | **原生 JavaScript，零运行时依赖**（约 100 行，替代了参考站点的 jQuery + WOW + CounterUp + Owl Carousel） |
| 外部 CDN | **完全没有**。字体、样式、图标全部随构建打包，不依赖任何外部服务 |

> 特意没有用 Google Fonts：它在中国大陆访问不稳定，一旦超时页面字体会闪烁。
> 现在字体随站点一起分发，国内外访问速度一致。

### 设计令牌

配色**直接取自 `XI-Lab_logo.pdf` 最后一页的矢量填色**，不是随便挑的：

```css
--primary: #2E9BD6;   /* 品牌蓝 · 强调色（logo 标志的颜色） */
--dark:    #0E1F38;   /* 深海军蓝 · 主色（logo 的底色） */
--light:   #F1F8FF;   /* 极浅蓝 · 浅色底 */
```

辅助色也来自同一份文件：`#9FB8D4` / `#B9C9DD` / `#7E97B5`（logo 里几档蓝灰文字）。

橙色的使用面积严格控制在 5% 以内、只用于强调 —— 这个「克制」的思路是从参考站点
学来的，但颜色换成了你们自己的品牌蓝，这样 logo 和页面才是同一套视觉语言。

> 改品牌色只需要动 `src/styles/global.css` 顶部 `html:root` 里的 `--primary` / `--dark`，
> 全站（按钮、图标、边框、悬停态、光晕、人名高亮）会自动跟随。

### 一些实现上的取舍

- **花体小标题改为大写宽字距标签**。参考站点用 Pacifico 花体字做小标题，
  那是餐饮模板的遗留；我们改成「大写 + 宽字距 + 橙色横线」，
  保留了左右横线这个记忆点，气质更贴合科研机构，也省掉一个装饰性字体依赖。
- **滚动动画绝不牺牲可读性**。`.reveal` 元素默认是**可见**的，只有当 JavaScript
  明确接管时（`<html class="js-reveal">`）才先隐藏再动画。并且：
  - 不用 `IntersectionObserver`（后台标签页、无头渲染、预览抓取时它可能长期不回调）
  - 节流不用 `requestAnimationFrame`（未参与合成的页面里它会被暂停）
  - 打印样式强制显示
  - `body` 末尾还有一段内联兜底脚本

  换句话说，**即使整段 JavaScript 都挂了，正文也一定看得见**。
- **学生只用姓名卡片**。上百号人不放照片，让团队页的维护成本趋近于零。
- **没有 CDN 依赖**。参考站点从 jsdelivr / cdnjs / Google Fonts 加载资源，
  这些在国内都不稳定；本站全部自托管。
- **去掉了模板残留**。参考站点还留着 Cookies / Help / FQAs 死链和
  「Designed By HTML Codex」版权声明，这些都已清除。

### 无障碍与 SEO

- 语义化标签 + `aria-current` 标记当前页 + 跳转到主内容的 skip link
- 键盘焦点可见（`:focus-visible` 橙色焦点环），移动端菜单收起时不可聚焦
- 尊重系统的「减少动态效果」设置（`prefers-reduced-motion`）
- 每页独立的 `<title>` / `description` / `canonical` / `hreflang` / Open Graph 卡片
- 自动生成 `sitemap.xml` 与 `robots.txt`

---

## 目录结构

```
├─ astro.config.mjs          ← ★ 部署地址配置
├─ src/
│  ├─ config/site.ts         ← ★★★ 实验室基本信息（最先改这个）
│  ├─ data/
│  │  ├─ news.ts             ← ★ 最新动态
│  │  ├─ people.ts           ← ★ 团队成员
│  │  ├─ research.ts         ← ★ 研究方向
│  │  └─ publications.ts     ← ★ 论文
│  ├─ i18n/ui.ts             ← 界面文案（中/英）
│  ├─ styles/global.css      ← 设计令牌与全部样式
│  ├─ components/            ← 导航栏、页脚、卡片等组件
│  ├─ layouts/BaseLayout.astro ← <head> / SEO / 前端交互
│  ├─ views/                 ← 四个页面的主体（中英共用）
│  └─ pages/                 ← 八个路由文件（很薄，只引用 views）
├─ public/                   ← 静态资源（logo、图片、robots.txt）
├─ docs/
│  ├─ REFERENCE-ANALYSIS.md   ← 参考站点逆向分析
│  ├─ PLAN.md                 ← 构建方案与任务规划
│  └─ brand/XI-Lab_logo.pdf   ← ★ logo 源文件（提取脚本从这里读）
└─ _tools/                    ← 辅助脚本
   ├─ extract-logo.py         ← 从 PDF 提取 logo / favicon / 图标
   ├─ fetch-paper-figs.mjs    ← 下载 MDPI 论文插图（研究方向配图素材）
   ├─ build-research-figures.py ← 裁白边 / 缩放 / 写研究配图版权说明
   ├─ fetch-candidates.mjs    ← 从 NASA 下载首页配图素材
   ├─ build-about-images.py   ← 裁切 / 压缩 / 加角标，生成首页拼贴
   ├─ import-scholar.mjs      ← 从 Google Scholar 抓取结果导入论文
   ├─ optimize-og.py          ← 压缩分享图
   ├─ check-seo.mjs           ← 检查各页 title / canonical / hreflang
   ├─ verify-roster.mjs       ← 核对团队名单与年级分组
   ├─ verify-publications.mjs ← 核对论文数据的完整性
   ├─ verify-output.mjs       ← 检查产物里有没有残留的占位内容
   ├─ check-freshness.mjs     ← 检查 dist/ 是否比 src/ 旧
   ├─ check-deploy.mjs        ← 部署前自检（资源路径 / 大小写 / site 配置 / 依赖源）
   ├─ fix-lockfile-registry.mjs ← lockfile 下载地址换回官方 npm 源
   ├─ fetch-ci-log.mjs        ← 查 GitHub Actions 最近一次运行的失败步骤
   └─ extract-docx.py         ← 读 Selected Publications.docx（代表性论文清单）
```

---

## 待办清单

上线前需要完成：

**已完成**
- [x] 实验室名称：**多维智能实验室 / X-Dimensional Intelligence Lab / XI-Lab**
- [x] 隶属机构：西安电子科技大学 通信工程学院
- [x] 地址 `陕西省西安市西沣路兴隆段 266 号`、邮箱 `yangx@xidian.edu.cn`、GitHub 组织 `XI-Lab-XDU`
- [x] Logo 已从 `docs/brand/XI-Lab_logo.pdf` 提取并接入（导航栏 / favicon / 分享图）
- [x] 品牌色已切换为 logo 的蓝 `#2E9BD6` + 海军蓝 `#0E1F38`
- [x] 部署地址配置为个人账户用户站 `https://ckk038.github.io`（2026-09-21 从组织站改过来）
- [x] 研究方向改为四个（2026-09 更新）：多源数据智能分析 / 四维场景生成理解 / 具身智能与智能体 / 遥感目标智能感知
- [x] 方向配图：**取自实验室自己论文里的框架图**（3 篇 MDPI CC BY + 1 篇 arXiv），
      图片可点开看原图，卡片底部标出论文出处
- [x] 首页配图：四格分别对应四个研究方向（NASA 公有领域影像），第 1 格为交叉淡入动态效果
- [x] 首页「关于我们」文案：按 IIP 实验室的段落结构重写（隶属 → 团队 → 负责人 → 规模 → 方向，
      以及项目 → 期刊会议 → 专利）
- [x] 论文页去掉「按方向筛选」，直接按年份列出全部论文；数据里的 `topic` 字段一并清除
- [x] 部署流程已就绪：`.github/workflows/deploy.yml` 推送到 `main` 自动构建发布，
      仓库 `cKk038/cKk038.github.io` 已建、Pages 已开（Source = GitHub Actions）
- [x] 修掉首次部署失败（2026-09-21）：CI 的 `npm ci` 在 Linux 上 1 秒内报
      `Missing: @emnapi/runtime@1.11.3 from lock file` —— Windows 上生成的 lockfile
      没有记录只有 Linux 需要的 wasm32 平台变体依赖，跨平台补不齐。
      工作流改用 `npm install` 解决；并顺带做了两处加固：lockfile 的下载地址统一为
      官方源、`.npmrc` 固定源，避免国内镜像地址混进 CI；安装与构建步骤现在会把报错
      输出成 GitHub 注解，失败时不用管理员权限也能查到原因

- [x] 首页页脚「相关链接」改为四项（2026-09-22）：ISN全国重点实验室 / 通信工程学院 /
      杭州研究院 / XI-Lab GitHub。原文的「西安电子科技大学」一项移除（首页 Hero 里
      的西安电子科技大学链接保留），如需要保留在这一列表里请说一声
- [x] 首页 Hero 删掉「西安电子科技大学 · 通信工程学院」那行，保留下方链接
- [x] 顶部导航项在桌面端居中（原来靠 flex 的 space-between，左右宽度不等所以偏）
- [x] 代表性论文换成实验室《Selected Publications》清单里的 10 篇，引用格式已校对；
      新增 2 篇（ECCV 2026、ACM MM 2026），论文总数 100 → 102

**待实验室确认**
- [ ] 研究方向的 `points`（子方向条目）是按方向内涵整理的，需确认表述准确
- [ ] 首页「关于我们」第 1 段里的「教师 1 人、在读研究生 27 人」需与实验室口径核对
- [ ] **第 ① 个方向（多源数据智能分析）的配图许可需确认**：用的是 IEEE TIP 论文的
      arXiv 版（CC BY-NC-SA 4.0）。建议换成正式版插图或换成一篇 CC BY 论文的图
- [ ] 代表性论文里原本标注的「共同一作 `#`」「通讯作者 `*`」「CVPR Highlight」等信息，
      因站点没有图例机制被去掉了 —— 若想在页面上体现，需加一段图例说明
- [ ] 如果实验室有微信公众号，把二维码放到 `public/img/` 并填 `site.ts` 的 `contact.wechatQr`
- [ ] 论文列表只有 10 篇代表性论文用了完整姓名，其余 92 篇是 Scholar 的缩写形式。
      若想全表统一成完整姓名，需要用 Scholar 之外的来源逐条补（工作量大，非必要不建议）

**可选**
- [ ] 想换成别的论文插图：覆盖 `public/img/research/<方向id>.png` 即可，代码不用动
- [ ] 首页拼贴也可以换成实验室自己的照片或成果图（`src/config/site.ts` 的 `aboutImages`）
- [ ] 学生的 `nameEn`（拼音）目前只有杨老师填了，其余留空显示中文名 —— 需要就补
- [ ] 学生目前都没有照片（沿用参考站点的做法，维护成本最低）；想加照片就放
      `public/img/people/` 并填 `photo` 字段