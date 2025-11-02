#!/usr/bin/env node

/**
 * Скрипт для массового извлечения изображений из архивов всех работ
 * Использует backend функцию update-work-preview
 */

const FUNCTION_URL = 'https://functions.poehali.dev/29bd33fc-96f3-4da2-af7c-ce84a7103573';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const { Client } = require('pg');

async function getWorksWithoutPreview(limit = 50, offset = 0) {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    const result = await client.query(`
      SELECT id, title, download_url, file_url
      FROM t_p63326274_course_download_plat.works
      WHERE title NOT LIKE '[УДАЛЕНО]%'
        AND (download_url IS NOT NULL OR file_url IS NOT NULL)
        AND preview_image_url IS NULL
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows;
  } finally {
    await client.end();
  }
}

async function extractPreviewForWork(workId) {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_id: workId,
        extract_from_archive: true
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error extracting for work ${workId}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Начинаю массовое извлечение изображений из архивов...\n');
  
  const stats = {
    total: 0,
    successful: 0,
    noImages: 0,
    failed: 0,
    errors: []
  };
  
  let offset = 0;
  const batchSize = 50;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`\n📦 Загрузка партии работ (offset=${offset})...`);
    const works = await getWorksWithoutPreview(batchSize, offset);
    
    if (works.length === 0) {
      hasMore = false;
      break;
    }
    
    console.log(`📋 Найдено ${works.length} работ для обработки\n`);
    
    for (const work of works) {
      stats.total++;
      
      console.log(`[${stats.total}] Обработка: ${work.title.substring(0, 60)}...`);
      console.log(`    ID: ${work.id}`);
      
      const result = await extractPreviewForWork(work.id);
      
      if (result.success) {
        if (result.count && result.count > 0) {
          stats.successful++;
          console.log(`    ✅ Извлечено ${result.count} изображений`);
        } else {
          stats.noImages++;
          console.log(`    ⚠️  PNG не найдено в архиве`);
        }
      } else {
        stats.failed++;
        console.log(`    ❌ Ошибка: ${result.error || result.message || 'Unknown error'}`);
        stats.errors.push({
          workId: work.id,
          title: work.title,
          error: result.error || result.message
        });
      }
      
      // Пауза между запросами чтобы не перегрузить сервер
      await sleep(2000);
    }
    
    offset += batchSize;
    
    // Промежуточная статистика
    console.log('\n' + '='.repeat(60));
    console.log(`📊 ПРОМЕЖУТОЧНАЯ СТАТИСТИКА:`);
    console.log(`   Всего обработано: ${stats.total}`);
    console.log(`   ✅ Успешно: ${stats.successful}`);
    console.log(`   ⚠️  Без изображений: ${stats.noImages}`);
    console.log(`   ❌ Ошибки: ${stats.failed}`);
    console.log('='.repeat(60) + '\n');
  }
  
  // Финальная статистика
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ОБРАБОТКА ЗАВЕРШЕНА!');
  console.log('='.repeat(60));
  console.log(`📊 ИТОГОВАЯ СТАТИСТИКА:`);
  console.log(`   Всего обработано: ${stats.total}`);
  console.log(`   ✅ Успешно извлечено: ${stats.successful} (${(stats.successful / stats.total * 100).toFixed(1)}%)`);
  console.log(`   ⚠️  Без изображений: ${stats.noImages} (${(stats.noImages / stats.total * 100).toFixed(1)}%)`);
  console.log(`   ❌ Ошибки: ${stats.failed} (${(stats.failed / stats.total * 100).toFixed(1)}%)`);
  
  if (stats.errors.length > 0) {
    console.log('\n📝 Список ошибок:');
    stats.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`   ${idx + 1}. Work #${err.workId}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... и ещё ${stats.errors.length - 10} ошибок`);
    }
  }
  
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});
