require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = require('../config/db');

async function ensureDatabaseExists(dbName) {
  const bootstrap = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  });
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();
  console.log(`✓ Database "${dbName}" siap`);
}

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) UNIQUE,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_hp VARCHAR(15),
    alamat TEXT,
    role ENUM('masyarakat', 'admin') DEFAULT 'masyarakat',
    ktp_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS pengajuan_surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_tracking VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    jenis_surat ENUM('domisili', 'usaha', 'keterangan', 'pengantar', 'lainnya') NOT NULL,
    keperluan TEXT NOT NULL,
    dokumen_url VARCHAR(500),
    status ENUM('diajukan', 'diproses', 'selesai', 'ditolak') DEFAULT 'diajukan',
    catatan_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS pengaduan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_tracking VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    kategori ENUM('infrastruktur', 'kebersihan', 'keamanan', 'pelayanan', 'lainnya') NOT NULL,
    deskripsi TEXT NOT NULL,
    lokasi VARCHAR(255),
    foto_url VARCHAR(500),
    status ENUM('diajukan', 'diproses', 'selesai', 'ditolak') DEFAULT 'diajukan',
    catatan_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS status_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referensi_type ENUM('pengajuan', 'pengaduan') NOT NULL,
    referensi_id INT NOT NULL,
    status_lama VARCHAR(50),
    status_baru VARCHAR(50) NOT NULL,
    keterangan TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
  )`,
];

async function migrate() {
  const dbName = process.env.DB_NAME || 'silapor';
  await ensureDatabaseExists(dbName);

  const conn = await pool.getConnection();
  try {
    await conn.query(`USE \`${dbName}\``);
    console.log(`✓ Menggunakan database: ${dbName}`);

    for (const sql of migrations) {
      await conn.query(sql);
      console.log('✓ Migration executed');
    }
    // Seed admin default
    const bcrypt = require('bcryptjs');
    const [rows] = await conn.query("SELECT id FROM users WHERE email = 'admin@silapor.kopo'");
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await conn.query(
        `INSERT INTO users (nama, email, password, role, no_hp) VALUES (?, ?, ?, 'admin', ?)`,
        ['Admin Kelurahan Kopo', 'admin@silapor.kopo', hash, '081234567890']
      );
      console.log('✓ Default admin created (admin@silapor.kopo / admin123)');
    }
    const [tables] = await conn.query('SHOW TABLES');
    console.log('\n📋 Tabel yang dibuat:');
    tables.forEach((t) => console.log('   -', Object.values(t)[0]));

    console.log('\n✅ Database migration completed!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();
