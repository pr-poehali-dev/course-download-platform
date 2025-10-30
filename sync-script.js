// Автоматический скрипт синхронизации превью
const API_URL = 'https://functions.poehali.dev/c5c39645-740b-4fc3-8d3f-d4dc911fae68';
const BATCH_SIZE = 100;

async function syncBatch() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: BATCH_SIZE })
    });
    return await response.json();
}

async function syncAll() {
    let total = { processed: 0, success: 0, failed: 0 };
    let batchNum = 0;
    
    console.log('🚀 Начинаем синхронизацию...');
    
    while (true) {
        batchNum++;
        console.log(`\n📦 Батч ${batchNum}...`);
        
        const result = await syncBatch();
        
        total.processed += result.total_processed;
        total.success += result.success;
        total.failed += result.failed;
        
        console.log(`✅ Обработано: ${result.total_processed}, Успешно: ${result.success}, Ошибок: ${result.failed}`);
        
        if (result.total_processed < BATCH_SIZE) {
            break;
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('\n🎉 ГОТОВО!');
    console.log(`Всего: ${total.processed} | Успешно: ${total.success} | Ошибок: ${total.failed}`);
    
    return total;
}

syncAll();
