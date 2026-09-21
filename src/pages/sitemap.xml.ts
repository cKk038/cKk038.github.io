import type { APIRoute } from 'astro';
import { navItems } from '../config/site';
import { localizePath, type Lang } from '../i18n/ui';

/**
 * 生成 sitemap.xml，包含中英两套路由并互相标注 hreflang。
 * 注意：需要先在 astro.config.mjs 里把 `site` 改成真实域名，否则这里生成的是占位域名。
 */
export const GET: APIRoute = ({ site }) => {
  const langs: Lang[] = ['zh', 'en'];
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = navItems
    .map((item) => {
      const alternates = langs
        .map((lang) => {
          const href = new URL(localizePath(item.href, lang), site).href;
          return `    <xhtml:link rel="alternate" hreflang="${lang === 'zh' ? 'zh-CN' : 'en'}" href="${href}"/>`;
        })
        .join('\n');

      return langs
        .map((lang) => {
          const href = new URL(localizePath(item.href, lang), site).href;
          return [
            '  <url>',
            `    <loc>${href}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            '    <changefreq>weekly</changefreq>',
            `    <priority>${item.key === 'home' ? '1.0' : '0.8'}</priority>`,
            alternates,
            '  </url>',
          ].join('\n');
        })
        .join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};