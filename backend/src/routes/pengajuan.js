const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/connection');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const { uploadFile } = require('../services/storage');
const { generateTrackingNumber } = require('../utils/tracking');

const router = express.Router();

async function logStatus(conn, type, refId, oldStatus, newStatus, keterangan, userId) {
  await conn.query(
    'INSERT INTO status_log (referensi_type, referensi_id, status_lama, status_baru, keterangan, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
    [type, refId, oldStatus, newStatus, keterangan, userId]
  );
}

router.post(
  '/',
  authenticate,
  uploadDocument.single('dokumen'),
  [
    body('jenis_surat').isIn(['domisili', 'usaha', 'keterangan', 'pengantar', 'lainnya']),
    body('keperluan').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const nomor = generateTrackingNumber('SRV');
      let dokumenUrl = null;

      if (req.file) {
        const uploaded = await uploadFile(req.file, 'dokumen/surat');
        dokumenUrl = uploaded.url;
      }

      const [result] = await conn.query(
        `INSERT INTO pengajuan_surat (nomor_tracking, user_id, jenis_surat, keperluan, dokumen_url, status)
         VALUES (?, ?, ?, ?, ?, 'diajukan')`,
        [nomor, req.user.id, req.body.jenis_surat, req.body.keperluan, dokumenUrl]
      );

      await logStatus(conn, 'pengajuan', result.insertId, null, 'diajukan', 'Pengajuan surat diterima', req.user.id);
      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Pengajuan surat berhasil',
        data: { id: result.insertId, nomor_tracking: nomor, status: 'diajukan' },
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
      `SELECT ps.*, u.nama as nama_pemohon
       FROM pengajuan_surat ps
       JOIN users u ON ps.user_id = u.id
       WHERE ps.user_id = ?
       ORDER BY ps.created_at DESC`,
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
      `SELECT ps.*, u.nama as nama_pemohon, u.email, u.nik
       FROM pengajuan_surat ps
       JOIN users u ON ps.user_id = u.id
       ORDER BY ps.created_at DESC`
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
    const [existing] = await conn.query('SELECT * FROM pengajuan_surat WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengajuan tidak ditemukan' });
    }

    await conn.beginTransaction();
    await conn.query(
      'UPDATE pengajuan_surat SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, req.params.id]
    );
    await logStatus(conn, 'pengajuan', req.params.id, existing[0].status, status, catatan_admin, req.user.id);
    await conn.commit();

    res.json({ success: true, message: 'Status pengajuan diperbarui' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
