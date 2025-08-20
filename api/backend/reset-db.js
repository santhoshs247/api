const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/mospi-data.db');
const dbDir = path.dirname(dbPath);

try {
  // Remove existing files
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
  if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
  
  // Recreate with explicit permissions
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true, mode: 0o777 });
  fs.writeFileSync(dbPath, '', { mode: 0o666 });
  
  console.log('✅ Database reset successfully');
} catch (err) {
  console.error('❌ Reset failed:', err);
  process.exit(1);
}