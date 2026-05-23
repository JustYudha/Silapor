const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../database/connection');
const { authenticate } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const { uploadFile } = require('../services/storage');

const router = express.Router();

router.post(
  '/register',
  [
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('nik').optional().isLength({ min: 16, max: 16 }).withMessage('NIK harus 16 digit'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nama, email, password, nik, no_hp, alamat } = req.body;

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (nama, email, password, nik, no_hp, alamat, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nama, email, hash, nik || null, no_hp || null, alamat || null, 'masyarakat']
      );

      const token = jwt.sign(
        { id: result.insertId, email, role: 'masyarakat' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: { token, user: { id: result.insertId, nama, email, role: 'masyarakat' } },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users] = await pool.query(
        'SELECT id, nama, email, password, role, nik, no_hp, alamat, ktp_url FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      delete user.password;
      res.json({ success: true, data: { token, user } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nama, email, role, nik, no_hp, alamat, ktp_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/upload-ktp', authenticate, uploadDocument.single('ktp'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File KTP wajib diupload' });
    }

    const result = await uploadFile(req.file, 'dokumen/ktp');

    await pool.query('UPDATE users SET ktp_url = ? WHERE id = ?', [result.url, req.user.id]);

    res.json({
      success: true,
      message: result.local ? 'KTP berhasil diupload (mode lokal)' : 'KTP berhasil diupload ke S3 & CDN',
      data: { ktp_url: result.url, key: result.key },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
