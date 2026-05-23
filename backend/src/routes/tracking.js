const express = require('express');
const pool = require('../database/connection');

const router = express.Router();

router.get('/:nomor', async (req, res) => {
  const { nomor } = req.params;

  try {
    let data = null;
    let type = null;

    if (nomor.startsWith('SRV')) {
      const [rows] = await pool.query(
        `SELECT ps.*, u.nama as nama_pemohon
         FROM pengajuan_surat ps
         JOIN users u ON ps.user_id = u.id
         WHERE ps.nomor_tracking = ?`,
        [nomor]
      );
      if (rows.length > 0) {
        data = rows[0];
        type = 'pengajuan';
      }
    } else if (nomor.startsWith('PGD')) {
      const [rows] = await pool.query(
        `SELECT p.*, u.nama as nama_pelapor
         FROM pengaduan p
         JOIN users u ON p.user_id = u.id
         WHERE p.nomor_tracking = ?`,
        [nomor]
      );
      if (rows.length > 0) {
        data = rows[0];
        type = 'pengaduan';
      }
    } else {
      const [srv] = await pool.query('SELECT nomor_tracking FROM pengajuan_surat WHERE nomor_tracking = ?', [nomor]);
      const [pgd] = await pool.query('SELECT nomor_tracking FROM pengaduan WHERE nomor_tracking = ?', [nomor]);
      if (srv.length > 0 || pgd.length > 0) {
        return res.redirect(302, `/api/tracking/${nomor}`);
      }
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Nomor tracking tidak ditemukan' });
    }

    const [logs] = await pool.query(
      `SELECT sl.*, u.nama as updated_by_name
       FROM status_log sl
       LEFT JOIN users u ON sl.updated_by = u.id
       WHERE sl.referensi_type = ? AND sl.referensi_id = ?
       ORDER BY sl.created_at ASC`,
      [type, data.id]
    );

    res.json({
      success: true,
      data: {
        type,
        layanan: data,
        riwayat_status: logs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const [pengajuan] = await pool.query(
      `SELECT status, COUNT(*) as total FROM pengajuan_surat GROUP BY status`
    );
    const [pengaduan] = await pool.query(
      `SELECT status, COUNT(*) as total FROM pengaduan GROUP BY status`
    );
    const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = ?', ['masyarakat']);

    res.json({
      success: true,
      data: {
        pengajuan_surat: pengajuan,
        pengaduan: pengaduan,
        total_masyarakat: totalUsers[0].total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
