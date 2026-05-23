require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { generateTrackingNumber } = require('../utils/tracking');

async function seed() {
  const dbName = process.env.DB_NAME || 'silapor';

  const bootstrap = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: dbName,
  });

  console.log(`🌱 Seed database: ${dbName}\n`);

  const accounts = [
    {
      nama: 'Admin Kelurahan Kopo',
      email: 'admin@silapor.kopo',
      password: 'admin123',
      role: 'admin',
      no_hp: '081234567890',
    },
    {
      nama: 'Budi Santoso',
      email: 'budi@email.com',
      password: 'user123',
      role: 'masyarakat',
      nik: '3273010101990001',
      no_hp: '081111111111',
      alamat: 'Jl. Kopo No. 10, Bandung',
    },
  ];

  const userIds = {};

  for (const acc of accounts) {
    const [existing] = await bootstrap.query('SELECT id FROM users WHERE email = ?', [acc.email]);
    if (existing.length > 0) {
      userIds[acc.email] = existing[0].id;
      console.log(`✓ User sudah ada: ${acc.email}`);
      continue;
    }
    const hash = await bcrypt.hash(acc.password, 10);
    const [result] = await bootstrap.query(
      `INSERT INTO users (nama, email, password, role, nik, no_hp, alamat)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [acc.nama, acc.email, hash, acc.role, acc.nik || null, acc.no_hp || null, acc.alamat || null]
    );
    userIds[acc.email] = result.insertId;
    console.log(`✓ User dibuat: ${acc.email} (${acc.role}) — password: ${acc.password}`);
  }

  const masyarakatId = userIds['budi@email.com'];
  const adminId = userIds['admin@silapor.kopo'];

  // Sample pengajuan surat
  const [pjCount] = await bootstrap.query('SELECT COUNT(*) as c FROM pengajuan_surat');
  if (pjCount[0].c === 0) {
    const nomor = generateTrackingNumber('SRV');
    const [pj] = await bootstrap.query(
      `INSERT INTO pengajuan_surat (nomor_tracking, user_id, jenis_surat, keperluan, status)
       VALUES (?, ?, 'domisili', 'Untuk pendaftaran sekolah anak', 'diajukan')`,
      [nomor, masyarakatId]
    );
    await bootstrap.query(
      `INSERT INTO status_log (referensi_type, referensi_id, status_lama, status_baru, keterangan, updated_by)
       VALUES ('pengajuan', ?, NULL, 'diajukan', 'Pengajuan surat diterima', ?)`,
      [pj.insertId, masyarakatId]
    );
    console.log(`✓ Sample pengajuan: ${nomor}`);
  }

  // Sample pengaduan
  const [pgCount] = await bootstrap.query('SELECT COUNT(*) as c FROM pengaduan');
  if (pgCount[0].c === 0) {
    const nomor = generateTrackingNumber('PGD');
    const [pg] = await bootstrap.query(
      `INSERT INTO pengaduan (nomor_tracking, user_id, judul, kategori, deskripsi, lokasi, status)
       VALUES (?, ?, 'Lampu jalan mati', 'infrastruktur', 'Lampu di gang Kopo 3 mati sejak 3 hari', 'Gang Kopo 3 RT 02', 'diajukan')`,
      [nomor, masyarakatId]
    );
    await bootstrap.query(
      `INSERT INTO status_log (referensi_type, referensi_id, status_lama, status_baru, keterangan, updated_by)
       VALUES ('pengaduan', ?, NULL, 'diajukan', 'Pengaduan diterima', ?)`,
      [pg.insertId, masyarakatId]
    );
    console.log(`✓ Sample pengaduan: ${nomor}`);
  }

  const [tables] = await bootstrap.query('SHOW TABLES');
  console.log('\n📋 Tabel di database:');
  tables.forEach((t) => console.log('   -', Object.values(t)[0]));

  const [users] = await bootstrap.query('SELECT id, nama, email, role FROM users');
  console.log('\n👤 Akun login:');
  users.forEach((u) => console.log(`   [${u.role}] ${u.email}`));

  await bootstrap.end();
  console.log('\n✅ Seed selesai!');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
