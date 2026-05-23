# SiLapor Kopo

**Sistem Pelayanan Publik Cibolerang** — Platform digital kelurahan untuk pengajuan surat online, pengaduan masyarakat, dan tracking status layanan.

## Quick start

| Situasi | Panduan |
|---------|---------|
| Pakai **Laragon**, coding harian | [docs/LARAGON.md](docs/LARAGON.md) |
| Tugas butuh **Docker**, tanpa Docker Desktop | [docs/DOCKER-TANPA-DESKTOP.md](docs/DOCKER-TANPA-DESKTOP.md) |
| Docker Desktop error 500 | Pakai **Podman** atau **WSL2 Docker** (bukan Desktop) |

| Komponen      | Teknologi        |
| ------------- | ---------------- |
| Frontend      | React (Vite)     |
| Backend       | Express.js       |
| Database      | MySQL RDS        |
| Container     | Docker           |
| Orchestration | ECS Fargate      |
| Registry      | ECR              |
| Storage       | AWS S3           |
| CDN           | ImageKit.io      |
| CI/CD         | GitHub Actions   |

## Fitur Utama

- **Pengajuan surat online** — Domisili, usaha, keterangan, pengantar (+ upload dokumen PDF ke S3)
- **Pengaduan masyarakat** — Upload foto bukti ke S3 + ImageKit CDN
- **Tracking status layanan** — Nomor tracking `SRV-*` (surat) dan `PGD-*` (pengaduan)
- **Role user** — Masyarakat & Admin Kelurahan

## Struktur Proyek

```
Silapor/
├── backend/          # Express.js API
├── frontend/         # React SPA
├── infra/ecs/        # ECS Fargate task definition
├── .github/workflows/# CI/CD pipeline
└── docker-compose.yml
```

## Laragon + Docker untuk tugas (ringkas)

- **Harian:** Laragon MySQL + `npm run dev` → [docs/LARAGON.md](docs/LARAGON.md)
- **Bukti Docker:** `.\scripts\compose.ps1` (Podman/Docker) **atau** push GitHub → workflow `docker-build.yml`
- **Laporan:** arsitektur Docker → ECR → ECS tetap dari file `Dockerfile` & `infra/ecs/`

---

## Menjalankan Lokal (Tanpa Docker) — **Laragon / XAMPP**

**Syarat:** Node.js 20+ dan MySQL (XAMPP / Laragon / MySQL Installer)

```powershell
cd "Silapor"

# 1. Install dependencies (sekali)
cd backend; npm install; cd ..
cd frontend; npm install; cd ..

# 2. Salin & edit .env backend (sesuaikan password MySQL Anda)
copy backend\.env.example backend\.env

# 3. Buat database di phpMyAdmin: silapor_kopo
# 4. Migrasi
cd backend
npm run migrate

# 5. Jalankan (2 terminal) ATAU pakai script:
cd ..
.\scripts\start-local.ps1
```

| URL | Alamat |
|-----|--------|
| Frontend | http://localhost:5173 |
| API health | http://localhost:5000/api/health |

---

## Menjalankan Lokal (Docker)

> **Perlu Docker Desktop** terinstall & running. Jika muncul `docker is not recognized`, install dulu: https://www.docker.com/products/docker-desktop/

```powershell
cd Silapor
docker compose up -d --build
docker compose exec backend node src/database/migrate.js
```

| URL | Alamat |
|-----|--------|
| Frontend | http://localhost:8080 |
| API | http://localhost:5000/api/health |

### Docker error 500 (`dockerDesktopLinuxEngine`)

Ini artinya **Docker Engine belum jalan normal**, bukan error aplikasi SiLapor.

1. Buka **Docker Desktop** → tunggu status **Engine running** (hijau)
2. Klik ikon Docker (tray) → **Restart**
3. Jika masih gagal: Docker Desktop → **Settings** → **Troubleshoot** → **Restart** atau **Reset to factory defaults**
4. Pastikan **WSL 2** aktif (PowerShell Admin):
   ```powershell
   wsl --update
   wsl --shutdown
   ```
   Lalu buka lagi Docker Desktop
5. Cek engine sudah OK:
   ```powershell
   docker version
   ```
   Bagian **Server** harus muncul (bukan error 500)
6. Baru jalankan lagi:
   ```powershell
   docker compose up -d --build
   docker compose exec backend node src/database/migrate.js
   ```

---

## Menjalankan Lokal (Tanpa Docker) — Detail

### Backend

```bash
cd backend
cp .env.example .env
npm install
# Pastikan MySQL berjalan, sesuaikan .env
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

## Akun Demo

| Role        | Email                 | Password  |
| ----------- | --------------------- | --------- |
| Admin       | admin@silapor.kopo    | admin123  |
| Masyarakat  | (daftar sendiri)      | —         |

## Konfigurasi AWS

### S3 Bucket

1. Buat bucket `silapor-kopo-uploads` di region `ap-southeast-1`
2. IAM user/role dengan policy `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
3. Isi di `backend/.env`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`

### MySQL RDS

1. Buat RDS MySQL 8.0 instance
2. Security group: allow port 3306 dari ECS task
3. Isi `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` di environment ECS/Secrets Manager

### ImageKit CDN

1. Daftar di [imagekit.io](https://imagekit.io)
2. Isi `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
3. Foto pengaduan di-upload ke S3 lalu juga ke ImageKit untuk delivery CDN

### ECR + ECS Fargate

```bash
# Buat ECR repositories
aws ecr create-repository --repository-name silapor-backend
aws ecr create-repository --repository-name silapor-frontend

# Build & push manual
aws ecr get-login-password | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com
docker build -t silapor-backend ./backend
docker tag silapor-backend:latest ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/silapor-backend:latest
docker push ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/silapor-backend:latest
```

Edit `infra/ecs/task-definition.json` — ganti `ACCOUNT_ID` dengan AWS Account ID Anda.

### GitHub Actions Secrets

| Secret                    | Deskripsi              |
| ------------------------- | ---------------------- |
| `AWS_ACCESS_KEY_ID`       | IAM access key         |
| `AWS_SECRET_ACCESS_KEY`   | IAM secret key         |

## API Endpoints

| Method | Endpoint                      | Auth   | Deskripsi                |
| ------ | ----------------------------- | ------ | ------------------------ |
| POST   | `/api/auth/register`          | —      | Daftar masyarakat        |
| POST   | `/api/auth/login`             | —      | Login                    |
| POST   | `/api/auth/upload-ktp`        | JWT    | Upload KTP → S3          |
| POST   | `/api/pengajuan`              | JWT    | Ajukan surat + dokumen   |
| POST   | `/api/pengaduan`              | JWT    | Buat pengaduan + foto    |
| GET    | `/api/tracking/:nomor`        | —      | Cek status tracking      |
| GET    | `/api/pengajuan/all`          | Admin  | Semua pengajuan          |
| PATCH  | `/api/pengajuan/:id/status`   | Admin  | Update status            |

## Arsitektur Cloud

```
[Masyarakat/Admin]
        │
        ▼
   [CloudFront/ALB]
        │
   ┌────┴────┐
   ▼         ▼
[React]  [Express] ──► [MySQL RDS]
(Nginx)      │
             ├──► [S3 Bucket] (dokumen, foto, KTP)
             └──► [ImageKit CDN] (optimasi gambar)
             
[GitHub Actions] ──► [ECR] ──► [ECS Fargate]
```

## Lisensi

Proyek akademik — Cloud Computing, ITENAS.
