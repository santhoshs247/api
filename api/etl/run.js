// etl/run.js
const { processFile } = require('./transform/processor');
const { loadData } = require('./load/loader');
const config = require('./config/loader');
const path = require('path');
const fs = require('fs');

// etl/run.js
const { downloadDataset } = require('./extract/browserDownloader'); // Changed import
// ... rest of the file remains the same ...

// Configure logging with timestamps
const log = {
  info: (...args) => console.log(`[${new Date().toISOString()}] INFO:`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] WARN:`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] ERROR:`, ...args)
};

// Track ETL metrics
const metrics = {
  total: 0,
  success: 0,
  skipped: 0,
  failed: 0,
  recordsProcessed: 0
};

async function runETL() {
  log.info('Starting ETL process');
  
  // Filter and validate datasets
  const supportedDatasets = config.datasets.filter(ds => {
    if (ds.type !== 'csv') {
      log.warn(`Skipping ${ds.name} - unsupported type: ${ds.type}`);
      metrics.skipped++;
      return false;
    }
    return true;
  });

  metrics.total = supportedDatasets.length;
  
  if (metrics.skipped > 0) {
    log.warn(`${metrics.skipped} datasets skipped due to unsupported file types`);
  }

  // Process each dataset
  for (const [index, dataset] of supportedDatasets.entries()) {
    const datasetStart = Date.now();
    log.info(`Processing dataset ${index + 1}/${metrics.total}: ${dataset.name}`);
    
    try {
      // 1. EXTRACT
      log.info(`Downloading ${dataset.name}...`);
      const filePath = await downloadDataset(dataset)
        .catch(err => {
          throw new Error(`Download failed: ${err.message}`);
        });

      // 2. TRANSFORM
      log.info(`Processing ${dataset.name} data...`);
      const records = await processFile(filePath, dataset)
        .catch(err => {
          throw new Error(`Processing failed: ${err.message}`);
        });

      // 3. LOAD
      if (records.length > 0) {
        log.info(`Loading ${records.length} records...`);
        await loadData(dataset.name.toLowerCase(), records)
          .catch(err => {
            throw new Error(`Database load failed: ${err.message}`);
          });
        metrics.recordsProcessed += records.length;
        metrics.success++;
        
        const duration = ((Date.now() - datasetStart) / 1000).toFixed(2);
        log.info(`✅ ${dataset.name} completed in ${duration}s: ${records.length} records processed`);
      } else {
        metrics.skipped++;
        log.warn(`⚠️  ${dataset.name} processed but returned no records`);
      }

    } catch (error) {
      metrics.failed++;
      log.error(`❌ ${dataset.name} failed:`, error.message);
      
      // Clean up temporary files on failure
      try {
        const tempDir = path.join(__dirname, 'temp', dataset.name);
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          log.info(`Cleaned up temporary files for ${dataset.name}`);
        }
      } catch (cleanupErr) {
        log.error('Cleanup failed:', cleanupErr.message);
      }
    }
  }

  // Final report
  log.info('\nETL Process Completed');
  log.info('====================');
  log.info(`Total datasets: ${metrics.total}`);
  log.info(`Successful: ${metrics.success}`);
  log.info(`Failed: ${metrics.failed}`);
  log.info(`Skipped: ${metrics.skipped}`);
  log.info(`Total records processed: ${metrics.recordsProcessed}`);
  
  if (metrics.failed > 0) {
    process.exit(1); // Exit with error code if any failures
  }
}

// Handle top-level errors
process.on('unhandledRejection', (err) => {
  log.error('Unhandled rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err);
  process.exit(1);
});

// Run with async context
(async () => {
  try {
    await runETL();
  } catch (err) {
    log.error('Fatal ETL error:', err);
    process.exit(1);
  }
})();