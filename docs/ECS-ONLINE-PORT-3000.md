# Deploy SiLapor Online — ECS Port 3000

Satu container menjalankan **React + Express API** di **port 3000**.

## Arsitektur

```
Internet → ALB (port 80) → Target Group (port 3000) → ECS Fargate Task
                                                              ↓
                                                    Express :3000
                                                    ├── /api/*  → API
                                                    └── /*      → React Web
                                                              ↓
                                                         AWS RDS (silapor)
```

## 1. AWS Console — ECS Task Definition

- Container port: **3000**
- Environment: `PORT=3000`, `NODE_ENV=production`, `DB_NAME=silapor`
- Secrets: `DB_HOST`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, AWS keys

## 2. ECS Service + Load Balancer

| Setting | Nilai |
|---------|--------|
| Container port | **3000** |
| Target group | **`silapor-backend-tg`** (harus ada target terdaftar!) |
| Target group port | **3000** |
| Load balancer | **`silapor-alb`** |
| Health check path | `/api/health` |
| Cluster | `silapor-cluster` |
| Service | `silapor-backend-service` |

> Target group **0 targets**? → Ikuti **`docs/FIX-TARGET-GROUP-KOSONG.md`**

**Security Group ECS:** allow inbound **3000** dari ALB security group.

**Security Group ALB:** allow inbound **80** (HTTP) dari `0.0.0.0/0`.

## 3. RDS Security Group

Allow MySQL **3306** dari Security Group ECS task.

## 4. Environment Variables (ECS)

```
PORT=3000
NODE_ENV=production
DB_HOST=silapor-db....rds.amazonaws.com
DB_USER=admin
DB_PASS=***
DB_NAME=silapor
AWS_REGION=us-east-1
S3_BUCKET=silapor-storage-yudha
FRONTEND_URL=https://ALB-DNS-ANDA.us-east-1.elb.amazonaws.com
```

## 5. Deploy via GitHub Actions

```powershell
git add .
git commit -m "deploy: ECS port 3000 web + api"
git push origin main
```

Workflow: `.github/workflows/deploy.yml`

## 6. Akses website

Setelah deploy sukses:

```
http://<ALB-DNS-name>
```

- Halaman web: `/`
- API health: `/api/health`
- Login admin: `admin@silapor.kopo` / `admin123`

## 7. Tes build Docker lokal (opsional)

```powershell
cd "...\Silapor"
docker build -f backend/Dockerfile.prod -t silapor:test .
docker run -p 3000:3000 --env-file backend/.env -e NODE_ENV=production -e PORT=3000 silapor:test
```

Buka http://localhost:3000

## Development lokal (tetap bisa)

| Mode | Perintah | URL |
|------|----------|-----|
| Dev terpisah | `npm run dev` (root) | Frontend :5173, API :5000 |
| Production lokal | Docker di atas | :3000 |
