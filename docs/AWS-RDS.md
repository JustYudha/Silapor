# Alur Data SiLapor — ECS → RDS

```
[Masyarakat Browser]
        │
        ▼
[React Frontend] ──► [ALB / ECS Fargate : Backend Express]
                              │
                              │  process.env.DB_HOST
                              │  process.env.DB_USER
                              │  process.env.DB_PASS
                              ▼
                    [AWS RDS MySQL]
                    silapor-db.xxx.rds.amazonaws.com
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
  [S3 Bucket]                              [ImageKit CDN]
  upload foto/KTP/PDF                      delivery gambar
```

## Environment Variables (ECS Task / Secrets Manager)

| Variable | Contoh | Keterangan |
|----------|--------|------------|
| `DB_HOST` | `silapor-db....rds.amazonaws.com` | Endpoint RDS |
| `DB_USER` | `admin` | Username MySQL RDS (bukan IAM) |
| `DB_PASS` | `***` | Password MySQL RDS |
| `DB_NAME` | `silapor_kopo` | Nama database |
| `DB_PORT` | `3306` | Port MySQL |
| `AWS_ACCESS_KEY_ID` | dari IAM | Untuk S3 (bukan untuk login MySQL) |
| `AWS_SECRET_ACCESS_KEY` | dari IAM | Untuk S3 |
| `S3_BUCKET_NAME` | `silapor-kopo-uploads` | Bucket region sama dengan RDS |

> **Penting:** Access Key IAM untuk **S3**. Login database RDS pakai **username/password MySQL** yang dibuat saat buat RDS.

## Tes dari laptop ke RDS

1. RDS Security Group → allow inbound **3306** dari IP laptop Anda (sementara)
2. `backend/.env` → set `DB_HOST` ke endpoint RDS
3. `npm run migrate` lalu `npm run dev`
4. Log: `✅ Berhasil terhubung ke database AWS RDS!`

## Keamanan

- Jangan commit `.env` ke GitHub
- Simpan rahasia di **AWS Secrets Manager** untuk ECS
- Rotate IAM key jika pernah terkirim ke chat/email
