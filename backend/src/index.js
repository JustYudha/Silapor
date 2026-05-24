require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { useLocalStorage, UPLOAD_DIR } = require('./services/storage');

const { testConnection } = require('./config/db');

const authRoutes = require('./routes/auth');
const pengajuanRoutes = require('./routes/pengajuan');
const pengaduanRoutes = require('./routes/pengaduan');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: process.env.FRONTEND_URL || (isProd ? true : 'http://localhost:5173'),
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

// Production ECS: serve React build (satu port 3000 untuk web + API)
const publicDir = path.join(__dirname, '../public');
if (isProd && fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

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

async function startServer() {
  await testConnection();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏛️  SiLapor Kopo running on port ${PORT}`);
    console.log(`📍 Sistem Pelayanan Publik Cibolerang`);
    if (isProd && fs.existsSync(path.join(publicDir, 'index.html'))) {
      console.log(`🌐 Web + API: http://0.0.0.0:${PORT}`);
    }
    console.log(`🗄️  DB Host: ${process.env.DB_HOST || 'localhost'}`);
    if (useLocalStorage()) {
      console.log(`📁 Upload mode: LOKAL (folder uploads/) — tanpa AWS S3`);
    }
  });
}

startServer().catch((err) => {
  console.error('Gagal memulai server:', err);
  process.exit(1);
});

module.exports = app;
