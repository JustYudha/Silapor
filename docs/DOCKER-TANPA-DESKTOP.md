# Docker untuk Tugas — TANPA Docker Desktop

Tugas minta **Docker**, bukan harus **Docker Desktop**.  
File `Dockerfile` + `docker-compose.yml` di repo ini **sudah memenuhi** komponen Container.

Yang perlu Anda tunjukkan ke dosen:

1. Ada **Dockerfile** (backend & frontend)
2. Ada **docker-compose.yml**
3. Container **bisa di-build** (lokal via alternatif, atau CI GitHub Actions)
4. Deploy production → **ECR + ECS Fargate** (gambar/diagram di laporan)

---

## Opsi A — Podman Desktop (paling mudah di Windows)

Mirip Docker, gratis, tidak pakai Docker Desktop.

1. Download: https://podman-desktop.io/downloads
2. Install → buka Podman Desktop → tunggu mesin virtual siap
3. Di terminal Laragon/PowerShell:

```powershell
# Cek
podman --version
podman compose version
```

4. Jalankan proyek (dari folder Silapor):

```powershell
podman compose up -d --build
podman compose exec backend node src/database/migrate.js
```

Buka: http://localhost:8080

> Perintah sama dengan `docker compose`, ganti `docker` → `podman`.

**Untuk laporan:** tulis *"Container runtime: Podman (OCI-compatible dengan Docker)"* + screenshot `podman compose ps`.

---

## Opsi B — Docker Engine di WSL2 (tanpa Desktop)

1. PowerShell Admin:

```powershell
wsl --install -d Ubuntu
# restart PC jika diminta
```

2. Buka **Ubuntu** (WSL):

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

3. Install Compose plugin:

```bash
sudo apt update
sudo apt install -y docker-compose-plugin
```

4. Jalankan proyek dari path Windows:

```bash
cd /mnt/c/Users/Yudha02/Documents/Itenas/Semester\ 6/CloudComputing/Silapor
docker compose up -d --build
docker compose exec backend node src/database/migrate.js
```

Akses dari Windows: http://localhost:8080

---

## Opsi C — GitHub Actions (bukti Docker tanpa laptop)

Push repo ke GitHub → workflow `.github/workflows/deploy.yml` akan:

- `docker build` backend & frontend
- Push ke ECR (jika secrets AWS diisi)

**Untuk tugas tanpa AWS:** buat workflow build-only (sudah ada job `test` + bisa screenshot log **Build image**).

Screenshot log Actions = bukti Docker dipakai di pipeline CI/CD.

---

## Strategi kuliah (disarankan)

| Kegiatan | Tool |
|----------|------|
| Coding & demo harian | **Laragon** + `npm run dev` |
| Bukti Docker / Container | **Podman** atau **WSL Docker** atau screenshot **GitHub Actions** |
| Laporan arsitektur | Diagram Docker → ECR → ECS Fargate (dari README) |
| Database tugas | MySQL (Laragon = dev, RDS = production di laporan) |

Dosen biasanya menilai: **file Docker ada + bisa dijelaskan + pipeline/compose jalan di suatu environment**.  
Tidak wajib Docker Desktop.

---

## Troubleshooting Podman

| Masalah | Solusi |
|---------|--------|
| Port 3306 bentrok | Laragon MySQL matikan dulu saat `podman compose up`, atau ubah port MySQL di compose |
| Port 8080 bentrok | Ubah `"8080:80"` di docker-compose.yml |
| Build lambat | Normal di pertama kali |
