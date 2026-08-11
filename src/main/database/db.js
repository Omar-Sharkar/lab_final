const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool;

async function initDatabase() {
  const dbName = process.env.DB_NAME || 'smart_restaurant';

  // First, connect without a database to create it if needed
  const tempConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  // Drop and recreate the database to ensure a clean state
  // This handles cases where a previous run left partial/corrupt tables
  const [rows] = await tempConn.query(
    `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [dbName]
  );
  if (rows.length > 0) {
    // Check if critical tables exist — if not, the DB is corrupt from a bad prior run
    const [tables] = await tempConn.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`, [dbName]
    );
    if (tables.length === 0) {
      console.log('⚠️ Database exists but is incomplete. Dropping and recreating...');
      await tempConn.query(`DROP DATABASE \`${dbName}\``);
    }
  }
  await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await tempConn.end();

  // Create the connection pool
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: false
  });

  // Test the connection
  const connection = await pool.getConnection();
  console.log(`✅ Connected to MySQL database: ${dbName}`);
  connection.release();

  // Run schema with foreign key checks disabled to avoid ordering issues
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Strip full-line -- comments first, then split by semicolons
    const cleanedSchema = schema
      .split('\n')
      .map(line => line.trim().startsWith('--') ? '' : line)
      .join('\n');

    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Use a SINGLE dedicated connection so SET FOREIGN_KEY_CHECKS persists
    const schemaConn = await pool.getConnection();
    try {
      await schemaConn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const statement of statements) {
        try {
          await schemaConn.query(statement);
        } catch (err) {
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
            console.warn('Schema warning:', err.message.substring(0, 100));
          }
        }
      }
      await schemaConn.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log(`✅ Database schema initialized (${statements.length} statements executed)`);
    } finally {
      schemaConn.release();
    }
  } else {
    console.warn('⚠️ Schema file not found at:', schemaPath);
  }

  return pool;
}

function getPool() {
  return pool;
}

module.exports = { initDatabase, getPool };
