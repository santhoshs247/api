require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const knex = require('knex');
const rateLimit = require('express-rate-limit');
const storage = require('./services/storage');

// Initialize Express app
const app = express();

// ==============================================
// Environment Validation
// ==============================================
const requiredEnvVars = ['PORT', 'DB_PATH'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.log('ℹ️ Ensure your .env file contains:');
  console.log('PORT=3001');
  console.log('DB_PATH=./db/mospi-data.db');
  process.exit(1);
}

// ==============================================
// Database Initialization
// ==============================================
const dbPath = path.resolve(__dirname, process.env.DB_PATH);
console.log(`📂 Database path: ${dbPath}`);

// Enhanced file creation with proper permissions
// Replace your initializeDatabaseFile() with this:
const initializeDatabaseFile = () => {
  try {
    const dir = path.dirname(dbPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { 
        recursive: true,
        mode: 0o777
      });
      console.log(`Created directory: ${dir}`);
    }

    // Force create file with explicit permissions
    fs.closeSync(fs.openSync(dbPath, 'w+', 0o666));
    console.log(`Database file created at: ${dbPath}`);

  } catch (err) {
    console.error('File creation error:', err);
    process.exit(1);
  }
};

initializeDatabaseFile();

// ==============================================
// Knex Configuration
// ==============================================
const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: dbPath,
    flags: [
      'OPEN_URI',
      'OPEN_SHAREDCACHE',
      'OPEN_READWRITE',
      'OPEN_CREATE'  // ← Add this to ensure file creation
    ]
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 5,
    idleTimeoutMillis: 30000,
    afterCreate: (conn, done) => {
      conn.run('PRAGMA journal_mode = WAL;', () => {
        conn.run('PRAGMA foreign_keys = ON;', done);
      });
    }
  },
  debug: process.env.NODE_ENV === 'development',
  log: {
    warn(message) {
      console.warn('⚠️ Knex Warning:', message);
    },
    error(message) {
      console.error('❌ Knex Error:', message);
    },
    debug(message) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('🐛 Knex Debug:', message);
      }
    }
  }
};

const knexInstance = knex(knexConfig);

// ==============================================
// Middleware Setup
// ==============================================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
  message: {
    error: 'Too many requests',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 30
  }
});

app.use(express.json());
app.use(limiter);

// ==============================================
// Database Health Check
// ==============================================
let lastFetchTime = null;

const verifyDatabase = async () => {
  try {
    const result = await knexInstance.raw('SELECT 1+1 as result');
    if (result && result[0].result === 2) {
      console.log('✅ Database connection verified');
      return true;
    }
    throw new Error('Unexpected query result');
  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error('- Error:', error.message);
    if (error.sql) console.error('- SQL:', error.sql);
    return false;
  }
};

// ==============================================
// API Routes
// ==============================================
app.get('/fetch-status', (req, res) => {
  res.json({
    status: 'active',
    running: true,
    lastFetch: lastFetchTime,
    nextFetch: new Date(Date.now() + 60000),
    uptime: process.uptime()
  });
});

app.get('/datasets', async (req, res) => {
  try {
    const datasets = await knexInstance('datasets').select('*');
    lastFetchTime = new Date();
    res.json({
      status: 'success',
      count: datasets.length,
      data: datasets
    });
  } catch (error) {
    console.error('Datasets query failed:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch datasets',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/health', async (req, res) => {
  const dbHealthy = await verifyDatabase();
  const status = dbHealthy ? 200 : 503;
  
  res.status(status).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date(),
    dbPath: dbPath,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// ==============================================
// Application Startup
// ==============================================
const initialize = async () => {
  console.log('\n🚀 Initializing application...');
  console.log(`⏳ Environment: ${process.env.NODE_ENV || 'development'}`);

  // Verify database connection
  if (!await verifyDatabase()) {
    console.error('⛔ Fatal: Database connection failed');
    process.exit(1);
  }

  // Initialize database schema
  try {
    console.log('🔄 Initializing database tables...');
    await storage.init(knexInstance);
    console.log('✅ Database initialization complete');
  } catch (initError) {
    console.error('❌ Database initialization failed:');
    console.error('- Error:', initError.message);
    if (initError.sql) console.error('- SQL:', initError.sql);
    process.exit(1);
  }

  // Start server
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    console.log('\n🎉 Server successfully started');
    console.log(`👉 Local: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📁 Database: ${dbPath}`);
    console.log(`🕒 Started at: ${new Date().toISOString()}\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      knexInstance.destroy().then(() => {
        console.log('✅ Server and database connections closed');
        process.exit(0);
      });
    });
  });
};

// ==============================================
// Error Handling
// ==============================================
process.on('unhandledRejection', (err) => {
  console.error('\n⛔ Unhandled rejection:');
  console.error(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('\n⛔ Uncaught exception:');
  console.error(err);
  process.exit(1);
});

// Start the application
initialize();