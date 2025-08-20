module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'E:/dblite/api/api/backend/db/mospi-data.db',
      flags: [
        'OPEN_URI',
        'OPEN_SHAREDCACHE',
        'OPEN_READWRITE',
        'OPEN_CREATE',
        'BUSY_TIMEOUT=5000'  // Add retry logic
      ]
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA journal_mode = WAL;', cb);
        conn.run('PRAGMA busy_timeout = 5000;');
      }
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
};