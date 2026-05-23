const mysql = require('mysql2/promise');

/**
 * Koneksi ke MySQL (AWS RDS di ECS / Laragon lokal).
 * Environment Variables: DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'silapor',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ Berhasil terhubung ke database AWS RDS! (${process.env.DB_HOST})`);
    return true;
  } catch (err) {
    console.error('❌ Gagal menyambung ke AWS RDS:', err.message);
    return false;
  }
}

// Export pool untuk query (routes: pool.query(...))
// testConnection diekspor terpisah — JANGAN set pool.pool = pool (stack overflow)
module.exports = pool;
module.exports.testConnection = testConnection;
