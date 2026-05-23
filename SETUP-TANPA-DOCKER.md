# SiLapor Kopo — Jalankan TANPA Docker

Docker **tidak wajib** untuk development. Stack tugas (S3, ECS, dll.) bisa didemokan lewat dokumentasi + deploy nanti di mesin/cloud lain.

## Yang dibutuhkan

| Software | Download |
|----------|----------|
| Node.js 20+ | https://nodejs.org |
| MySQL | **XAMPP** (paling mudah): https://www.apachefriends.org |

## Langkah (15 menit)

### 1. Install XAMPP & nyalakan MySQL

1. Install XAMPP
2. Buka **XAMPP Control Panel** → Start **MySQL**
3. Buka http://localhost/phpmyadmin
4. Buat database baru: **`silapor_kopo`**

### 2. Setup project

PowerShell:

```powershell
cd "c:\Users\Yudha02\Documents\Itenas\Semester 6\CloudComputing\Silapor"

# Install semua dependency
npm run install:all

# Salin config (jika belum)
copy backend\.env.example backend\.env
```

Edit `backend\.env` untuk XAMPP (default):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=silapor_kopo
USE_LOCAL_STORAGE=true
```

### 3. Migrasi database (sekali)

```powershell
npm run migrate
```

Harus muncul: `Database migration completed!`

### 4. Jalankan aplikasi

**Cara A — satu perintah:**

```powershell
npm install
npm run dev
```

**Cara B — script Windows:**

```powershell
.\scripts\start-local.ps1
```

### 5. Buka browser

| | URL |
|---|-----|
| Aplikasi | http://localhost:5173 |
| API | http://localhost:5000/api/health |

**Login Admin:** `admin@silapor.kopo` / `admin123`

---

## Upload file tanpa AWS

Dengan `USE_LOCAL_STORAGE=true` (atau tanpa kredensial AWS), file disimpan di folder `backend/uploads/` dan tetap bisa diakses dari aplikasi.

Untuk tugas: jelaskan di laporan bahwa **production** memakai S3 + ImageKit, **development lokal** memakai penyimpanan lokal.

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| `ECONNREFUSED` database | MySQL XAMPP belum Start |
| `Access denied for user` | Sesuaikan `DB_USER` / `DB_PASSWORD` di `.env` |
| `Unknown database` | Buat DB `silapor_kopo` di phpMyAdmin |
| Port 5000 dipakai | Tutup app lain atau ubah `PORT` di `.env` |

---

## Untuk presentasi tugas Cloud Computing

Tanpa Docker di laptop, Anda tetap bisa:

1. **Demo aplikasi** — jalankan lokal (panduan ini)
2. **Diagram arsitektur** — React, Express, MySQL RDS, S3, ECS Fargate di README
3. **Deploy production** — GitHub Actions + AWS (saat punya akun AWS), atau screenshot dari AWS Console

Docker/ECS dipakai saat deploy ke cloud, bukan wajib di laptop sehari-hari.
