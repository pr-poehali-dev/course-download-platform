#!/usr/bin/env node
import fs from 'fs';

const BASE_URL = 'https://coursework.poehali.dev';
const TODAY = '2025-11-27';
const WORKS_API = 'https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413';

const STATIC_PAGES = [
  ['/', '1.0', 'daily'],
  ['/catalog', '0.9', 'daily'],
  ['/catalog?category=курсовая', '0.8', 'daily'],
  ['/catalog?category=диплом', '0.8', 'daily'],
  ['/catalog?category=реферат', '0.8', 'daily'],
  ['/catalog?category=контрольная', '0.7', 'daily'],
  ['/catalog?category=эссе', '0.7', 'daily'],
  ['/catalog?category=отчет', '0.7', 'daily'],
  ['/blog', '0.8', 'weekly'],
  ['/bot-subscription', '0.8', 'weekly'],
  ['/marketplace', '0.8', 'weekly'],
  ['/buy-points', '0.6', 'monthly'],
  ['/register', '0.7', 'monthly'],
  ['/login', '0.6', 'monthly'],
  ['/offer', '0.5', 'monthly'],
  ['/privacy-policy', '0.5', 'monthly'],
  ['/terms-of-service', '0.5', 'monthly'],
  ['/usage-rules', '0.4', 'monthly'],
  ['/requisites', '0.3', 'yearly'],
  ['/roskomnadzor-guide', '0.3', 'yearly'],
];

async function fetchAllApprovedWorks() {
  console.log('Fetching all approved works...');
  const response = await fetch(`${WORKS_API}?limit=1000&status=approved`);
  const data = await response.json();
  return data.works || [];
}

function generateSitemap(works) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // Add static pages
  for (const [path, priority, changefreq] of STATIC_PAGES) {
    lines.push('  <url>');
    lines.push(`    <loc>${BASE_URL}${path}</loc>`);
    lines.push(`    <lastmod>${TODAY}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push('  </url>');
  }

  // Add work pages
  for (const work of works) {
    lines.push('  <url>');
    lines.push(`    <loc>${BASE_URL}/work/${work.id}</loc>`);
    lines.push(`    <lastmod>${TODAY}</lastmod>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

async function main() {
  try {
    const works = await fetchAllApprovedWorks();
    
    console.log(`✅ Found ${works.length} approved works`);
    
    if (works.length > 0) {
      const workIds = works.map(w => w.id).sort((a, b) => a - b);
      console.log(`First 5 IDs: ${workIds.slice(0, 5).join(', ')}`);
      console.log(`Last 5 IDs: ${workIds.slice(-5).join(', ')}`);
    }
    
    console.log('\nGenerating sitemap.xml...');
    const sitemap = generateSitemap(works);
    
    const outputPath = 'public/sitemap.xml';
    fs.writeFileSync(outputPath, sitemap, 'utf-8');
    
    const totalUrls = STATIC_PAGES.length + works.length;
    
    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📄 File: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`  - Static pages: ${STATIC_PAGES.length}`);
    console.log(`  - Work pages: ${works.length}`);
    console.log(`  - Total URLs: ${totalUrls}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
