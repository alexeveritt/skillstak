// Initialize local database for Node.js development mode
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const dbPath = path.join(dbDir, 'local.sqlite');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove existing database to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

// Create database
const db = new Database(dbPath);

// Read and execute schema
const schemaPath = path.join(__dirname, '../db/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute each statement separately
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log('Creating database tables...');
for (const statement of statements) {
  try {
    db.exec(statement);
  } catch (error) {
    console.error('Error executing statement:', statement.substring(0, 100));
    console.error(error.message);
  }
}

// Verify tables were created
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables created:', tables.map(t => t.name).join(', '));

db.close();
console.log('✅ Database initialized successfully!');
