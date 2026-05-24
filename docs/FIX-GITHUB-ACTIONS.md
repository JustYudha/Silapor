# Fix GitHub Actions Error (build-and-push)

## Kenapa error `build-and-push`?

Screenshot error **`build-and-push`** berasal dari **workflow LAMA** (`SiLapor Kopo CI/CD`) yang sudah diganti.

Workflow lama gagal biasanya karena:

| Penyebab | Solusi |
|----------|--------|
| Secrets belum di-set | GitHub repo → **Settings → Secrets → Actions** → tambah `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` |
| ECR repo belum ada | AWS → ECR → Create repository **`silapor-backend`** |
| Build salah path | Dulu `docker build ./backend` — sekarang pakai `Dockerfile.prod` dari root |
| IAM tidak punya hak push ECR | Policy: `ecr:*`, `ecs:UpdateService` |

## Workflow sekarang (yang benar)

File: **`.github/workflows/deploy.yml`**

- Job name: **`deploy`** (bukan `build-and-push`)
- Build: `docker build -f backend/Dockerfile.prod .`
- Push ke ECR: `silapor-backend:latest`
- Deploy ECS: `silapor-cluster` / `silapor-backend-service`

## Cek run terbaru

GitHub → **Actions** → pilih workflow **"Deploy ECS"** (bukan "SiLapor Kopo CI/CD")

## Setup secrets (wajib)

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## Setup ECR (wajib)

```
Repository name: silapor-backend
Region: us-east-1
```

## Push ulang

```powershell
git add .github/workflows/
git commit -m "fix: simplify deploy workflow"
git push origin main
```

Kalau masih gagal, buka step merah di Actions dan baca baris error terakhir (biasanya `denied` / `repository does not exist` / `npm ERR`).
