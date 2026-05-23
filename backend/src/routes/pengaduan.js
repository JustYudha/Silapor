const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/connection');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const { uploadImageWithCdn } = require('../services/storage');
const { generateTrackingNumber } = require('../utils/tracking');

const router = express.Router();

async function logStatus(conn, refId, oldStatus, newStatus, keterangan, userId) {
  await conn.query(
    'INSERT INTO status_log (referensi_type, referensi_id, status_lama, status_baru, keterangan, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
    ['pengaduan', refId, oldStatus, newStatus, keterangan, userId]
  );
}

router.post(
  '/',
  authenticate,
  uploadImage.single('foto'),
  [
    body('judul').notEmpty(),
    body('kategori').isIn(['infrastruktur', 'kebersihan', 'keamanan', 'pelayanan', 'lainnya']),
    body('deskripsi').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const nomor = generateTrackingNumber('PGD');
      let fotoUrl = null;

      if (req.file) {
        const { s3, cdn } = await uploadImageWithCdn(req.file, 'foto/pengaduan');
        fotoUrl = cdn?.url || s3.url;
      }

      const [result] = await conn.query(
        `INSERT INTO pengaduan (nomor_tracking, user_id, judul, kategori, deskripsi, lokasi, foto_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'diajukan')`,
        [nomor, req.user.id, req.body.judul, req.body.kategori, req.body.deskripsi, req.body.lokasi || null, fotoUrl]
      );

      await logStatus(conn, result.insertId, null, 'diajukan', 'Pengaduan diterima', req.user.id);
      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Pengaduan berhasil dikirim',
        data: { id: result.insertId, nomor_tracking: nomor, status: 'diajukan', foto_url: fotoUrl },
      });
    } catch (err) {
      await conn.rollback();
      res.status(500).json({ success: false, message: err.message });
    } finally {
      conn.release();
    }
  }
);

router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pengaduan WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.nama as nama_pelapor, u.email
       FROM pengaduan p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status, catatan_admin } = req.body;
  const validStatus = ['diajukan', 'diproses', 'selesai', 'ditolak'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid' });
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT * FROM pengaduan WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengaduan tidak ditemukan' });
    }

    await conn.beginTransaction();
    await conn.query(
      'UPDATE pengaduan SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, req.params.id]
    );
    await logStatus(conn, req.params.id, existing[0].status, status, catatan_admin, req.user.id);
    await conn.commit();

    res.json({ success: true, message: 'Status pengaduan diperbarui' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
