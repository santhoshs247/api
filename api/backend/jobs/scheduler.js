const cron = require('node-cron');
const fetchDatasets = require('./fetch-datasets');

// Run every minute
cron.schedule('* * * * *', async () => {
  console.log('⏳ Running scheduled data fetch...');
  try {
    await fetchDatasets();
    lastFetchTime = new Date();
    console.log('✅ Data fetch completed at', new Date().toISOString());
  } catch (error) {
    console.error('❌ Scheduled fetch failed:', error);
  }
});

module.exports = cron;