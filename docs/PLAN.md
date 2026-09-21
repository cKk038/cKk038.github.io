# 实验室主页 · 构建方案与任务规划

> Slogan：**多维之间，智能之上** / **Beyond dimensions, beyond intelligence.**

---

## 一、技术选型与理由

| 方案 | 评价 |
|---|---|
| A. 纯静态 HTML（照抄参考站点） | 最省事，但导航/页脚/双语要在 4~8 个文件里重复维护，改一条新闻要动 HTML 结构，长期维护成本高 |
| B. React / Vite SPA | 对公网站点没必要：SEO 差、首屏慢、实验室没人会维护 |
| **C. Astro（★ 采用）** | 组件复用（导航/页脚只写一次）、内容与模板分离、**构建产物是纯静态 HTML**、可一键部署 GitHub Pages、零运行时 JS 框架 |

**采用 Astro + Bootstrap 5 + 自写 CSS + 原生 JS。**

关键点：

- **产物是纯静态 HTML**（`dist/`），和参考站点完全同构 —— 没有框架锁定，随时能退回手写 HTML。
- **去掉 jQuery 全家桶**。参考站点依赖 jQuery + Owl Carousel + WOW.js + Waypoints + CounterUp 五个库；我们改用原生 `IntersectionObserver` + CSS 实现滚动揭示和数字滚动，依赖从 5 个降到 0。
- **Bootstrap 5 自托管**（npm 引入，走构建），不依赖任何 CDN —— 国内访问不会因为 CDN 挂掉而白屏。字体同理走系统字体栈 + 可选自托管。

### 依赖清单

```
astro            ^7     静态站点框架（构建期）
bootstrap        ^5.3   栅格与基础组件（构建期打包）
bootstrap-icons  ^1    图标字体（构建期打包）
```

运行时依赖：**零**。

---

## 二、设计系统（延续参考站点的视觉语言）

```css
:root {
  --primary: #2E9BD6;   /* 品牌蓝 · 强调色 */
  --dark:    #0E1F38;   /* 深海军蓝 · 主色 */
  --light:   #F1F8FF;   /* 极浅蓝 · 浅色底 */
}
```

> 注：规划阶段沿用的是参考站点的琥珀橙 `#FEA116`。拿到 `XI-Lab_logo.pdf` 后发现
> 实验室的品牌色是蓝，于是三个值全部改为从 logo 矢量里读出来的真实品牌色，
> 详见 README 的「设计令牌」一节。橙色的使用面积严格控制在 5% 以内、
> 只用于强调这个「克制」的思路始终没变。

- 字体：标题 `Nunito` 700/800，正文 `Nunito` 400–600，花体小标题 `Pacifico`（保留参考站点的记忆点）
- 复用参考站点的组件类名语义：`.hero-header` / `.section-title` / `.service-item` / `.team-item` / `.project-card` / `.news-name`
- 橙色的使用面积严格控制在 5% 以内（只用于强调），这是参考站点"学术但不土"的关键

> 后续拿到 logo 后，会把 `--primary` / `--dark` 微调为 logo 主色，保证品牌一致。

---

## 三、信息架构与页面

| 路由（中文） | 路由（English） | 页面 |
|---|---|---|
| `/` | `/en/` | 首页：Hero（slogan）→ 关于我们 + 数字统计 → 最新动态 → 页脚 |
| `/team/` | `/en/team/` | 团队：教师 → 博士生 → 硕士生 → 校友（博士）→ 校友（硕士） |
| `/research/` | `/en/research/` | 研究：研究方向卡 → 代表性论文（按年份分组） |
| `/publications/` | `/en/publications/` | 论文总览（按年份 + 按方向筛选） |

双语实现：**独立路由**（不是 JS 换字），SEO 友好；UI 文案放 `src/i18n/ui.ts`，内容字段用 `{ zh, en }` 结构，缺一侧时自动回退。

---

## 四、目录结构

```
Lab_Homepage/
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ README.md                     ← 中文维护手册（怎么改内容/怎么部署）
├─ docs/
│   ├─ REFERENCE-ANALYSIS.md      ← 参考站点逆向分析
│   └─ PLAN.md                    ← 本文档
├─ .github/workflows/deploy.yml   ← 推送到 main 自动部署 GitHub Pages
├─ public/
│   ├─ .nojekyll                  ← ★ 必须，否则 GitHub Pages 会吞掉 _astro 目录
│   ├─ favicon.svg
│   ├─ logo.svg                   ← ★ 占位，等你的 logo 替换
│   └─ img/                       ← 照片（研究员头像、课题配图）
└─ src/
    ├─ config/site.ts             ← ★★★ 实验室身份信息（名称/slogan/地址/邮箱/链接）
    ├─ data/
    │   ├─ news.ts                ← 最新动态
    │   ├─ people.ts              ← 团队成员
    │   ├─ research.ts            ← 研究方向
    │   └─ publications.ts        ← 论文
    ├─ i18n/ui.ts                 ← 界面文案（中/英）
    ├─ styles/global.css          ← 设计令牌 + 自定义组件样式
    ├─ components/
    │   ├─ Navbar.astro  Footer.astro
    │   ├─ Hero.astro    SectionTitle.astro  StatCounter.astro
    │   ├─ NewsList.astro  PersonCard.astro
    │   ├─ ProjectCard.astro  PublicationList.astro
    │   └─ BackToTop.astro
    ├─ layouts/BaseLayout.astro   ← <head> / SEO / OG / 语言切换
    ├─ views/                     ← 页面主体（zh/en 共用同一组件）
    │   ├─ HomeView.astro  TeamView.astro
    │   ├─ ResearchView.astro  PublicationsView.astro
    └─ pages/
        ├─ index.astro  team.astro  research.astro  publications.astro
        └─ en/index.astro  en/team.astro  en/research.astro  en/publications.astro
```

---

## 五、任务分解（含依赖顺序）

| # | 任务 | 依赖 | 产出 |
|---|---|---|---|
| 1 | 逆向参考站点（技术栈/设计令牌/页面几何/组件类） | — | `docs/REFERENCE-ANALYSIS.md` ✅ |
| 2 | 选定技术栈 + 定架构 | 1 | `docs/PLAN.md` ✅ |
| 3 | 初始化 Astro 工程 + 依赖安装 | 2 | `package.json` / `astro.config.mjs` |
| 4 | 设计系统：令牌 + 全局样式（移植并改良参考 CSS） | 3 | `src/styles/global.css` |
| 5 | 内容配置层：`site.ts` + 四份数据文件（类型安全） | 3 | `src/config/`, `src/data/` |
| 6 | 双语层：`i18n/ui.ts` + `BaseLayout` 语言切换 | 4 | `src/i18n/`, `layouts/` |
| 7 | 共用外壳：Navbar / Footer / BackToTop / 滚动揭示 | 4,6 | `components/` |
| 8 | 首页视图（Hero 含 slogan / 关于 / 统计 / 动态） | 5,6,7 | `views/HomeView.astro` |
| 9 | 团队页视图（教师卡 / 学生名卡 / 校友） | 5,6,7 | `views/TeamView.astro` |
| 10 | 研究页视图（方向卡 + 代表性论文） | 5,6,7 | `views/ResearchView.astro` |
| 11 | 论文总览页（年份分组 + 方向筛选 + 链接） | 5,6,7 | `views/PublicationsView.astro` |
| 12 | 中英路由（8 个 page 文件） | 8–11 | `src/pages/**` |
| 13 | SEO：sitemap / robots.txt / OG / favicon | 12 | `public/`, `layouts/` |
| 14 | 本地构建 + 浏览器验收（响应式/链接/控制台/视觉） | 12,13 | 截图 + 修复 |
| 15 | GitHub Actions 自动部署 + 中文维护手册 | 14 | `.github/`, `README.md` |
| 16 | 接入你的 logo（替换占位 + 微调配色） | 用户提供 logo | 最终品牌 |
| 17 | 内容填充（实验室正式名称/成员/动态/论文） | 用户提供资料 | 上线内容 |

---

## 六、当前需要你提供的信息（不阻塞开发，先占位）

我用**占位内容**先把站点跑通，以下信息拿到后填入 `src/config/site.ts` 与 `src/data/*.ts` 即可：

| 项 | 用在哪 | 状态 |
|---|---|---|
| 🔴 **实验室中文名 / 英文名 / 简称** | 导航栏、Hero、页脚、`<title>` | **待提供**（最关键） |
| 🔴 **学校 / 学院 / 隶属实验室** | Hero 副标题、页脚、About | 待提供 |
| 🟠 **Logo 文件**（SVG/PNG，最好带透明底 + 白色版） | 导航栏、页脚、favicon、Hero 旋转图形 | 你说"要用时再给" |
| 🟠 **研究方向**（3–5 个方向 + 每个方向的子条目） | 研究页 | 待提供 |
| 🟠 **导师 / 成员名单**（姓名 + 职称，教师需照片） | 团队页 | 待提供 |
| 🟡 **最新动态**（日期 + 事件文字 + 高亮人名） | 首页 | 待提供 |
| 🟡 **代表性论文**（作者/标题/期刊会议/年份/链接） | 研究页、论文页 | 待提供 |
| 🟡 **联系信息**（地址、邮箱、GitHub 组织、微信公众号） | 页脚 | 待提供 |
| ⚪ **部署方式**（GitHub Pages 组织站 / 项目站 / 自建域名） | 部署工作流 | 待确认 |

---

## 七、验收标准

1. `npm run build` 零错误、零警告通过
2. 8 个路由全部可访问，中英切换在每一页都正确
3. 响应式：375 / 768 / 1440px 三档无横向滚动、无重叠、无空白
4. 浏览器控制台零报错、零 404（图片/字体/图标）
5. 导航栏滚动吸顶、移动端汉堡菜单可开合
6. 首页统计数字滚动动画、卡片悬停动效正常
7. Lighthouse：Performance / Accessibility / Best Practices / SEO 均 ≥ 90
8. 所有内容都可在 `src/data/*.ts` 中改完，无需碰模板代码