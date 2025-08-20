const fetcher = require('../services/fetcher');
const storage = require('../services/storage');

module.exports = async () => {
  await storage.init();
  
  // Force fresh fetch ignoring cache
  const datasets = await fetcher.fetchAll({ forceRefresh: true });
  
  let count = 0;
  for (const dataset of datasets.filter(Boolean)) {
    await storage.storeDataset(dataset);
    count++;
  }
  
  console.log(`🔄 Updated ${count} datasets`);
  return count;
};