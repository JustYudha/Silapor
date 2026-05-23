require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { useLocalStorage, UPLOAD_DIR } = require('./services/storage');

const authRoutes = require('./routes/auth');
const pengajuanRoutes = require('./routes/pengajuan');
const pengaduanRoutes = require('./routes/pengaduan');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'SiLapor Kopo API',
    domain: 'Sistem Pelayanan Publik Cibolerang',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stack: {
      backend: 'Express.js',
      database: 'MySQL RDS',
      storage: useLocalStorage() ? 'Local (dev)' : 'AWS S3',
      cdn: useLocalStorage() ? 'Local (dev)' : 'ImageKit.io',
      mode: useLocalStorage() ? 'development-local' : 'production',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/pengajuan', pengajuanRoutes);
app.use('/api/pengaduan', pengaduanRoutes);
app.use('/api/tracking', trackingRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err.message?.includes('Format')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏛️  SiLapor Kopo API running on port ${PORT}`);
  console.log(`📍 Sistem Pelayanan Publik Cibolerang`);
  if (useLocalStorage()) {
    console.log(`📁 Upload mode: LOKAL (folder uploads/) — tanpa AWS S3`);
  }
});

module.exports = app;
