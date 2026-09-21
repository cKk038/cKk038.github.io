# 参考站点分析：IIP-XDU Lab (https://iip-xdu.github.io/)

分析日期：2026-09-20

## 1. 技术栈（参考站点实际使用的）

| 项 | 内容 |
|---|---|
| 站点形态 | 纯静态多页 HTML（`index.html` / `team.html` / `research.html`） |
| 模板来源 | HTML Codex 的 **Restoran** 模板（餐饮模板改造成实验室主页） |
| CSS 框架 | Bootstrap 5.0.0（本地 `css/bootstrap.min.css`） |
| JS | jQuery 3.4.1 + Bootstrap bundle + WOW.js（滚动动画）+ Owl Carousel（轮播）+ Waypoints + CounterUp（数字滚动）+ Tempus Dominus（日期，模板残留） |
| 图标 | Font Awesome 5.10.0 + Bootstrap Icons 1.4.1 |
| 字体 | Google Fonts: `Nunito`（正文）、`Heebo`、`Pacifico`（花体小标题） |
| 图片 | 本地 `img/` 目录 |
| 部署 | GitHub Pages（`*-xdu.github.io` 组织站点） |

> 注：HTML 中带 `data-page-node-id` 属性，说明页面是从可视化建站工具导出的 HTML。

## 2. 设计令牌（Design Tokens）

参考站点 `css/style.css` 只有 9.6KB，核心就是三个 CSS 变量：

```css
:root {
    --primary: #FEA116;   /* 琥珀橙 —— 强调色、按钮、花体标题、悬停态 */
    --light:   #F1F8FF;   /* 极浅蓝 —— 浅色区块背景、深色上的文字 */
    --dark:    #0F172B;   /* 深海军蓝 —— 导航栏、Hero、页脚 */
}
```

补充色（自定义）：

```css
.news-name {
    color: #B45309;                    /* 新闻中的人名高亮（棕橙） */
    background: rgba(254, 161, 22, .16);
}
```

字号/字重体系：

```
标题：Nunito 700/800 (fw-semi-bold / fw-medium)
正文：Nunito 400-600，15px
花体小标题：Pacifico（就是那个手写体 "About Us" / "Recent News"）
按钮：Nunito 500，全部大写 text-transform: uppercase
```

关键自定义组件类：

| 类名 | 作用 |
|---|---|
| `.hero-header` | 深色渐变叠在背景图上：`linear-gradient(rgba(15,23,43,.85), rgba(15,23,43,.9)), url(bg-hero.jpg)` |
| `.hero-header img` | 50 秒匀速旋转动画（`@keyframes imgRotate`）—— 参考站点用来转 logo |
| `.section-title` | 花体小标题，左右各一条 45px 橙色横线（`::before` / `::after`） |
| `.service-item` | 白卡片 `box-shadow: 0 0 45px rgba(0,0,0,.08)`，悬停整卡变橙、文字变白 |
| `.team-item` | 人员卡片，悬停图片 `scale(1.1)` 且卡片高度 `calc(100% - 38px)` → `100%`（向上生长） |
| `.project-card` | 研究课题卡，左图右文，窄屏自动上下堆叠 |
| `.footer .btn-link` | 页脚链接，前置 `\f105` Font Awesome 箭头，悬停 `letter-spacing: 1px` |
| `.back-to-top` | 右下角固定橙色方块回到顶部按钮 |
| `#spinner` | 首屏全屏加载动画，`.show` 时可见 |

## 3. 页面结构（自上而下）

### 3.1 首页 `index.html`（总高 2087px @1440×950）

| y 坐标 | 区块 | 内容 |
|---|---|---|
| 0 | **导航栏** | `position: absolute` 悬浮在 Hero 上；滚动后 `.sticky-top` 变 `position: fixed` + 深色实底 |
| 0–397 | **Hero** | 深色渐变背景，居中 `<h1>Welcome to IIP Lab.</h1>`，下方橙色大写链接 `XIDIAN UNIVERSITY` |
| 445–1057 | **About Us** | 左：2×2 研究图片拼贴（机器狗 / 人形机器人 / 控制台 / 机械臂）；右：花体 `About Us` + 深色大标题 + 2 段介绍 + 统计数字（`200` Top/CCF-A PUBLICATIONS、`40` Phd/Master STUDENTS，数字带橙色左边框）+ 橙色 `JOIN US` 按钮 |
| 1056–1630 | **Recent News** | 浅蓝底；居中花体 `Recent News`；白卡片内：左 `Recent News` 粗体 + 右橙色 `2026`，横线下是项目符号列表 |
| 1678–2087 | **页脚** | 深色；4 列：`Laboratory` / `Contact` / `Links` / `Pages`（花体橙色标题 + 横线）；底部版权行 `© IIP Lab., All Right Reserved.` |

### 3.2 团队页 `team.html`（总高 5748px）

- **page-header**：`Our Team` 大标题 + 面包屑 `HOME / GITHub / TEAM`（中间项橙色）
- **Academic Staffs**：4 列人员卡片网格（10 人）—— 照片（浅灰底 box）+ 姓名（粗体深色）+ 职称（浅灰小字）
- **Ph.D. Candidates**：4 列姓名卡片（13 人，无照片）
- **Master Students**：4 列姓名卡片（约 55 人）
- **Alumni · PH.D.**：4 列姓名卡片（20 人）
- **Alumni · Postgraduates**：4 列姓名卡片（约 60 人）

> 学生/校友是**只有姓名**的极简卡片，没有照片 —— 这是很好的取舍，避免维护上百张照片。

### 3.3 研究页 `research.html`（总高 8316px）

- **page-header**：`Research` + 面包屑
- **Research Projects**：3 张 `.project-card`，每张 = 左图 + 右侧标题 + 橙色方块图标按钮 + 一句话简介 + 4 条子方向列表
  - Embodied Intelligence（具身智能）
  - Visual Understanding（视觉理解）
  - Artificial Intelligence Generated Content (AIGC)
- **Selected Publications**：按年份分组，年份行 = 左侧深色年份 + 右侧橙色年份 + 底部横线；下方 `<ul><li>` 列表，每条格式：
  `作者1, 作者2, ..., 作者N: 论文标题. **会议/期刊简称**, 年份.`（期刊简称加粗）

## 4. 导航与 IA（信息架构）

顶部导航（3 项，极简）：`HOME` / `TEAM` / `RESEARCH`，右侧一个 **中/英 语言切换**按钮。

页脚四列：

| Laboratory | Contact | Links | Pages |
|---|---|---|---|
| About Us | 地址（含定位图标） | Xidian University | Home |
| Team Members | 邮编城市（含定位图标） | Hangzhou Institute | Team |
| Research Topics | 邮箱（含信封图标） | ISN State Key Lab. | Research |
| | 微信 / GitHub 圆形社交按钮 | VIPSL (Xinbo Gao) | |

## 5. 值得借鉴的设计决策

1. **克制的配色**：只有深蓝 / 橙 / 浅蓝三个颜色，橙色只用于强调（<5% 面积），整体非常"学术且不土"。
2. **花体小标题 + 左右横线**：`.section-title` 用 Pacifico 花体字，是整套设计的记忆点。
3. **Hero 极简**：只有一句欢迎语 + 一个机构链接，不堆信息，显得大气。
4. **新闻区用卡片 + 人名高亮**：`.news-name` 把学生姓名高亮成琥珀色小块，让"谁发了论文"一目了然 —— 这是最值得抄的一个细节。
5. **学生只用姓名卡片**：上百号人不需要照片，维护成本趋近于零。
6. **论文按年份分组 + 期刊简称加粗**：扫读效率高。
7. **数字统计区**：`200` / `40` 两个大数字立刻建立"实验室实力"的印象。
8. **悬停微交互**：卡片阴影 → 变色 / 图片放大 / 卡片生长，成本低、质感高。

## 6. 参考站点的可改进点（我们要做得更好的地方）

| 问题 | 我们的做法 |
|---|---|
| 模板残留（Tempus Dominus 日期选择器、Cookies/Help/FQAs 死链、`Designed By HTML Codex`） | 全部清除 |
| jQuery + Owl Carousel + WOW + Waypoints + CounterUp 约 5 个 JS 依赖 | 用原生 JS（IntersectionObserver + CSS）替代，零 jQuery |
| Bootstrap CSS 本地整包引入（未按需） | 保持 Bootstrap 但**自托管**、无 CDN 依赖 |
| `team.html` 里学生区有一大段空白（轮播未渲染） | 用 CSS Grid，绝不出现空白 |
| 中英混排没有真正的双语内容体系（只是 JS 换字） | 独立路由 `/` 与 `/en/`，双语字段在数据层，SEO 友好 |
| 内容硬编码在 HTML 里，改一条新闻要动 HTML 结构 | 内容全部抽到 `src/data/*.ts`，改内容只需填对象 |
| 没有 DOI / 论文链接 | 论文条目支持 `links: [{label, url}]` |
| 无 `sitemap` / `robots.txt` / OG 卡片 | 补齐 SEO 与社交分享元信息 |