# SiLapor Kopo + Laragon (tanpa Docker Desktop)

## 1. Setup Laragon

1. Buka **Laragon** → **Start All** (Apache + MySQL)
2. Klik **Database** → buka **HeidiSQL** (atau phpMyAdmin)
3. Buat database: **`silapor_kopo`**

## 2. Config backend

File `backend/.env` (sesuaikan jika password Laragon Anda pakai `root`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=silapor_kopo

USE_LOCAL_STORAGE=true
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

> Laragon default: user `root`, password **kosong**.  
> Jika pakai password, isi di `DB_PASSWORD`.

## 3. Jalankan

```powershell
cd "...\Silapor"
npm run install:all
npm run migrate
npm run dev
```

| | URL |
|---|-----|
| App | http://localhost:5173 |
| API | http://localhost:5000/api/health |
| Admin | admin@silapor.kopo / admin123 |

## 4. Upload file (dev)

Tanpa AWS → file masuk `backend/uploads/` (tetap memenuhi fitur upload di demo).

Production / laporan: tetap jelaskan **S3 + ImageKit** seperti di README.
