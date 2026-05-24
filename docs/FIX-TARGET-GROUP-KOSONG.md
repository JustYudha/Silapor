# Target Group Kosong (0 targets) — Cara Memperbaiki

Screenshot Anda: **`silapor-backend-tg`** → **Total targets: 0**

Artinya: Load Balancer `silapor-alb` **belum terhubung** ke task ECS yang jalan, atau **task ECS gagal start**.

Target group sudah benar: **HTTP : 3000** ✅

---

## Checklist (urutkan dari atas)

### ✅ Langkah 1 — Pastikan ECS Task jalan

1. AWS Console → **ECS** → Cluster **`silapor-cluster`**
2. Klik service **`silapor-backend-service`**
3. Tab **Tasks** → harus ada task **RUNNING**

| Kondisi | Artinya |
|---------|---------|
| 0 task / STOPPED | Task gagal — buka task → **Logs** (CloudWatch) |
| RUNNING | Lanjut langkah 2 |

**Error umum di log:**
- `Cannot connect to RDS` → Security Group RDS / env `DB_*` salah
- `Unknown database` → `DB_NAME=silapor` belum migrate
- Crash port → pastikan `PORT=3000` di task definition

---

### ✅ Langkah 2 — Hubungkan ECS Service ke Target Group (PALING SERING)

1. ECS → **`silapor-backend-service`** → **Update service**
2. Scroll ke **Load balancing**
3. Pastikan:
   - Load balancer: **`silapor-alb`**
   - Listener: **80:HTTP** (atau 443 jika HTTPS)
   - Target group: **`silapor-backend-tg`**
   - **Container name:** `silapor-backend` (sama dengan task definition)
   - **Container port:** `3000`**
4. **Health check grace period:** `120` detik
5. **Update service** → centang **Force new deployment**

Setelah 2–5 menit, refresh Target Group → harus muncul **IP task** dengan status **healthy**.

---

### ✅ Langkah 3 — Task Definition port 3000

ECS → Task definitions → revision terbaru:

```json
"portMappings": [
  {
    "containerPort": 3000,
    "protocol": "tcp"
  }
]
```

Environment:
```
PORT=3000
NODE_ENV=production
DB_NAME=silapor
```

---

### ✅ Langkah 4 — Security Group

**SG untuk ECS task:**
- Inbound: **TCP 3000** — Source = Security Group **ALB** (`silapor-alb`)

**SG untuk ALB:**
- Inbound: **TCP 80** — Source = `0.0.0.0/0`

**SG untuk RDS:**
- Inbound: **TCP 3306** — Source = Security Group **ECS task**

---

### ✅ Langkah 5 — Health check Target Group

EC2 → Target Groups → **`silapor-backend-tg`** → **Health checks**:

| Setting | Nilai |
|---------|--------|
| Protocol | HTTP |
| Path | `/api/health` |
| Port | **Traffic port** (3000) |
| Healthy threshold | 2 |
| Interval | 30 |

---

### ✅ Langkah 6 — Subnet & Public IP (Fargate)

Service → Networking:
- **Subnets:** minimal 2 AZ
- **Auto-assign public IP:** **ENABLED** (jika task di subnet public tanpa NAT)
- Atau task di **private subnet + NAT Gateway** ke internet (pull ECR, RDS)

---

## Setelah target healthy

Buka DNS Load Balancer:

```
EC2 → Load Balancers → silapor-alb → DNS name
```

Contoh: `http://silapor-alb-123456789.us-east-1.elb.amazonaws.com`

- Web: `/`
- API: `/api/health`

---

## Perintah AWS CLI (opsional)

Ganti `subnet-xxx`, `sg-xxx` dengan milik Anda:

```bash
aws ecs update-service \
  --cluster silapor-cluster \
  --service silapor-backend-service \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:345362761947:targetgroup/silapor-backend-tg/955788c8f9d345ea,containerName=silapor-backend,containerPort=3000" \
  --health-check-grace-period-seconds 120 \
  --force-new-deployment \
  --region us-east-1
```

---

## Ringkas

```
GitHub push → ECR image → ECS deploy
                              ↓
         Service HARUS link ke silapor-backend-tg :3000
                              ↓
              Task RUNNING → target terdaftar → healthy
                              ↓
                    http://silapor-alb-xxx (DNS ALB)
```

GitHub Actions **hanya push image + force deploy**.  
**Registrasi ke target group** diatur di **konfigurasi ECS Service**, bukan di `deploy.yml`.
