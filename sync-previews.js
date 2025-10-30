/**
 * Script to sync preview images from Yandex Disk to database
 * Calls the API endpoint in batches until all works are processed
 */

const API_URL = 'https://functions.poehali.dev/c5c39645-740b-4fc3-8d3f-d4dc911fae68';
const BATCH_SIZE = 100;
const DELAY_MS = 1000; // 1 second delay between batches

// Cumulative statistics
const stats = {
  totalProcessed: 0,
  totalSuccess: 0,
  totalFailed: 0,
  batchesExecuted: 0,
  errors: []
};

// Sleep function for delay between batches
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to call the API endpoint
async function syncBatch(batchNumber) {
  console.log(`\n--- Batch ${batchNumber} ---`);
  console.log(`Calling API: ${API_URL}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit: BATCH_SIZE })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    // Update cumulative statistics
    stats.totalProcessed += data.total_processed || 0;
    stats.totalSuccess += data.success || 0;
    stats.totalFailed += data.failed || 0;
    stats.batchesExecuted++;
    
    if (data.errors && data.errors.length > 0) {
      stats.errors.push(...data.errors);
    }
    
    console.log(`Batch ${batchNumber} completed: ${data.total_processed} processed, ${data.success} success, ${data.failed} failed`);
    
    return data;
  } catch (error) {
    console.error(`Error in batch ${batchNumber}:`, error.message);
    throw error;
  }
}

// Main function to process all batches
async function syncAllPreviews() {
  console.log('====================================');
  console.log('Starting Preview Image Sync Process');
  console.log('====================================');
  console.log(`Target: 443 works`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Delay between batches: ${DELAY_MS}ms`);
  
  let batchNumber = 1;
  let continueProcessing = true;
  
  try {
    while (continueProcessing) {
      const result = await syncBatch(batchNumber);
      
      // Check if we should continue (total_processed equals the limit)
      if (result.total_processed < BATCH_SIZE) {
        console.log(`\nLast batch processed ${result.total_processed} works (less than ${BATCH_SIZE}). Stopping.`);
        continueProcessing = false;
      } else {
        console.log(`\nBatch complete. Waiting ${DELAY_MS}ms before next batch...`);
        await sleep(DELAY_MS);
        batchNumber++;
      }
    }
    
    // Print final statistics
    console.log('\n====================================');
    console.log('SYNC COMPLETE - FINAL STATISTICS');
    console.log('====================================');
    console.log(`Total works processed: ${stats.totalProcessed}`);
    console.log(`Total successful syncs: ${stats.totalSuccess}`);
    console.log(`Total failed syncs: ${stats.totalFailed}`);
    console.log(`Number of batches executed: ${stats.batchesExecuted}`);
    
    if (stats.errors.length > 0) {
      console.log(`\nErrors encountered (${stats.errors.length}):`);
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${JSON.stringify(error)}`);
      });
    } else {
      console.log(`\nNo errors encountered!`);
    }
    
    console.log('====================================');
    
    return stats;
  } catch (error) {
    console.error('\n====================================');
    console.error('SYNC FAILED');
    console.error('====================================');
    console.error('Error:', error.message);
    console.error('\nPartial statistics:');
    console.error(`Total works processed: ${stats.totalProcessed}`);
    console.error(`Total successful syncs: ${stats.totalSuccess}`);
    console.error(`Total failed syncs: ${stats.totalFailed}`);
    console.error(`Number of batches executed: ${stats.batchesExecuted}`);
    console.error('====================================');
    
    throw error;
  }
}

// Run the sync process
syncAllPreviews()
  .then(stats => {
    console.log('\nProcess completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nProcess failed!');
    process.exit(1);
  });
