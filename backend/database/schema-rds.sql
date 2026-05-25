-- ============================================================
-- SiLapor Kopo — SEMUA TABEL (sesuai ECS: DB_NAME=silapor-db)
-- Jalankan di: RDS Query Editor / HeidiSQL / DBeaver
-- ============================================================

CREATE DATABASE IF NOT EXISTS `silapor-db`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `silapor-db`;

-- 1. users — login masyarakat & admin
CREATE TABLE IF NOT EXISTS users (
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
) ENGINE=InnoDB;

-- 2. pengajuan_surat — pengajuan surat online
CREATE TABLE IF NOT EXISTS pengajuan_surat (
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
) ENGINE=InnoDB;

-- 3. pengaduan — pengaduan masyarakat
CREATE TABLE IF NOT EXISTS pengaduan (
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
) ENGINE=InnoDB;

-- 4. status_log — tracking riwayat status
CREATE TABLE IF NOT EXISTS status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referensi_type ENUM('pengajuan', 'pengaduan') NOT NULL,
  referensi_id INT NOT NULL,
  status_lama VARCHAR(50),
  status_baru VARCHAR(50) NOT NULL,
  keterangan TEXT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Admin default — password: admin123
INSERT INTO users (nama, email, password, role, no_hp)
SELECT 'Admin Kelurahan Kopo', 'admin@silapor.kopo',
  '$2a$10$VyioEGs9J2C8OYEDR2RneubAvS3tnr5bpfM/rbKJVpySOdepQHdtm',
  'admin', '081234567890'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@silapor.kopo');

SHOW TABLES;
SELECT id, nama, email, role FROM users;
