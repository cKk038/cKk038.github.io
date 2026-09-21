import fs from 'node:fs';

const files = [
  'dist/index.html',
  'dist/team/index.html',
  'dist/research/index.html',
  'dist/publications/index.html',
  'dist/en/index.html',
  'dist/en/team/index.html',
  'dist/en/research/index.html',
  'dist/en/publications/index.html',
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`${f}  → MISSING`);
    continue;
  }
  const h = fs.readFileSync(f, 'utf8');
  const title = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1];
  const canonical = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  const ogUrl = (h.match(/<meta property="og:url" content="([^"]+)"/) || [])[1];
  const alternates = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => `${m[1]}→${m[2]}`,
  );
  console.log(f);
  console.log(`  title     : ${title}`);
  console.log(`  canonical : ${canonical}`);
  console.log(`  og:url    : ${ogUrl}`);
  console.log(`  h1        : ${h1 ? h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 44) : '(none)'}`);
  console.log(`  hreflang  : ${alternates.join('  ')}`);
  console.log();
}