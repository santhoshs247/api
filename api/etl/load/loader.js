// etl/load/loader.js
const knex = require('../config/db');

async function loadData(datasetName, records) {
  return knex.batchInsert(datasetName, records, 100);
}