// etl/transform/processor.js
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Configure logging
const log = {
  info: (...args) => console.log('[Processor]', ...args),
  warn: (...args) => console.warn('[Processor] ⚠️', ...args),
  error: (...args) => console.error('[Processor] ❌', ...args)
};

// Supported processors
const processors = {
  csv: {
    process: async (filePath, schema) => {
      try {
        const csvProcessor = require('./formats/csvProcessor');
        return await csvProcessor.process(filePath, schema);
      } catch (err) {
        log.error(`CSV processing failed: ${err.message}`);
        throw err;
      }
    }
  },
  stata: {
    process: async (filePath, schema) => {
      log.warn('Stata support not implemented - skipping file');
      return []; // Graceful degradation
    }
  }
};

async function processFile(filePath, datasetConfig) {
  const { type, schema, name: datasetName } = datasetConfig;
  
  // Validate inputs
  if (!type || !processors[type]) {
    throw new Error(`Unsupported file type: ${type}`);
  }
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  log.info(`Processing ${datasetName} (${type.toUpperCase()})...`);
  
  try {
    // Get file stats to verify it's not empty
    const stats = await stat(filePath);
    if (stats.size === 0) {
      throw new Error('File is empty');
    }

    // Process the file
    const result = await processors[type].process(filePath, schema);
    
    // Validate output
    if (!Array.isArray(result)) {
      throw new Error('Processor did not return an array of records');
    }

    log.info(`Processed ${result.length} records from ${datasetName}`);
    return result;
    
  } catch (err) {
    log.error(`Failed to process ${datasetName}: ${err.message}`);
    throw err; // Re-throw for upstream handling
  }
}

module.exports = {
  processFile,
  processors
};