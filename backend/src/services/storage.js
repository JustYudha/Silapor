const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3 } = require('./s3');
const { uploadToImageKit } = require('./imagekit');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function useLocalStorage() {
  if (process.env.USE_LOCAL_STORAGE === 'true') return true;
  const key = process.env.AWS_ACCESS_KEY_ID;
  return !key || key === 'your_access_key' || key.startsWith('your_');
}

function ensureUploadDir(subfolder) {
  const dir = path.join(UPLOAD_DIR, subfolder);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function saveLocal(file, folder) {
  ensureUploadDir(folder);
  const ext = path.extname(file.originalname);
  const filename = `${uuidv4()}${ext}`;
  const relPath = `${folder}/${filename}`;
  const fullPath = path.join(UPLOAD_DIR, relPath);
  fs.writeFileSync(fullPath, file.buffer);
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return {
    key: relPath,
    url: `${baseUrl}/uploads/${relPath.replace(/\\/g, '/')}`,
    local: true,
  };
}

async function uploadFile(file, folder = 'uploads') {
  if (useLocalStorage()) {
    console.log(`📁 Local storage: ${folder}/${file.originalname}`);
    return saveLocal(file, folder);
  }
  return uploadToS3(file, folder);
}

async function uploadImageWithCdn(file, folder = 'uploads') {
  if (useLocalStorage()) {
    return { s3: await saveLocal(file, folder), cdn: null };
  }
  const s3 = await uploadToS3(file, folder);
  const cdn = await uploadToImageKit(file, folder);
  return { s3, cdn };
}

module.exports = { uploadFile, uploadImageWithCdn, useLocalStorage, UPLOAD_DIR };
