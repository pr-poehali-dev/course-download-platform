// Script to generate sitemap.xml with all approved works
// Run: node scripts/generate-sitemap.js

const fs = require('fs');
const https = require('https');

const API_URL = 'https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413';

async function fetchAllWorks() {
  return new Promise((resolve, reject) => {
    https.get(`${API_URL}?status=approved&limit=5000`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.works || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function generateSitemap() {
  console.log('📡 Загружаю работы из API...');
  const works = await fetchAllWorks();
  console.log(`✅ Получено ${works.length} одобренных работ`);

  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Главная страница -->
  <url>
    <loc>https://techforma.pro/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Каталог -->
  <url>
    <loc>https://techforma.pro/catalog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Основные категории -->
  <url>
    <loc>https://techforma.pro/catalog?category=курсовая</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=диплом</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=реферат</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=контрольная</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Блог и другие страницы -->
  <url>
    <loc>https://techforma.pro/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://techforma.pro/bot-subscription</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://techforma.pro/marketplace</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Все одобренные работы (${works.length}) -->
`;

  works.forEach(work => {
    xml += `  <url>
    <loc>https://techforma.pro/work/${work.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  xml += '</urlset>';

  fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
  console.log(`✅ Sitemap создан: public/sitemap.xml`);
  console.log(`📊 Всего URL: ${works.length + 13} (13 статических + ${works.length} работ)`);
  console.log(`📁 Размер файла: ${(xml.length / 1024).toFixed(2)} KB`);
  console.log(`\n🔗 Готов для загрузки в:`);
  console.log(`   • Яндекс.Вебмастер: https://webmaster.yandex.ru/`);
  console.log(`   • Google Search Console: https://search.google.com/search-console`);
}

generateSitemap().catch(console.error);