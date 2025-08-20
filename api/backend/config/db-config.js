const path = require('path');
const fs = require('fs');

// Resolve the correct absolute path
const dbPath = path.resolve(__dirname, '../db/mospi-data.db'); // Changed from '../../db'

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: dbPath,
    flags: [
      'OPEN_URI',
      'OPEN_SHAREDCACHE',
      'OPEN_READWRITE',
      'OPEN_CREATE' // Ensures file creation
    ]
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 5,
    afterCreate: (conn, done) => {
      conn.run('PRAGMA journal_mode = WAL;', done); // Better write performance
    }
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: path.resolve(__dirname, '../migrations') // Changed from '../../migrations'
  },
  seeds: {
    directory: path.resolve(__dirname, '../seeds') // Changed from '../../seeds'
  },
  debug: true // Enable query logging for debugging
};