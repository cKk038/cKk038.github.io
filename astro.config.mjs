// @ts-check
import { defineConfig } from 'astro/config';

/**
 * ★ 部署地址：会影响 sitemap.xml、canonical 与 OG 卡片。
 *
 * 下面按「组织站」配置，取自实验室的 GitHub 组织 XI-Lab-XDU。
 *   · 组织站： https://xi-lab-xdu.github.io          ← 当前配置，仓库名需为 XI-Lab-XDU.github.io
 *   · 项目站： https://xi-lab-xdu.github.io/homepage  需要额外加 base: '/homepage'
 *   · 自有域名：https://lab.example.edu.cn
 *
 * 改这里之后，别忘了同步 public/robots.txt 里的 Sitemap 地址。
 */
export default defineConfig({
  site: 'https://cKk038.github.io',
  build: {
    // 生成 /team/index.html 这种目录式结构，GitHub Pages 访问 /team 时不会 404
    format: 'directory',
  },
  compressHTML: true,
});