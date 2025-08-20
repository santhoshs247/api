// etl/config/db.js
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || 'E:/dblite/api/api/backend/db/mospi-data.db'
  },
  useNullAsDefault: true
});

module.exports = knex;