// etl/monitor.js
const knex = require('knex')(require('../../knexfile'));

async function checkETLStatus() {
  const results = await knex('etl_logs')
    .select('dataset')
    .max('timestamp as last_run')
    .count('records as record_count')
    .groupBy('dataset');
  
  console.table(results);
}