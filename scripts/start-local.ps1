# SiLapor Kopo - Jalankan lokal TANPA Docker (Windows)
# Butuh: Node.js 20+ dan MySQL (XAMPP / MySQL Installer / Laragon)

$Root = Split-Path $PSScriptRoot -Parent
Write-Host "=== SiLapor Kopo - Local Dev ===" -ForegroundColor Cyan

# Cek Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js belum terinstall. Download: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Setup backend .env jika belum ada
$backendEnv = Join-Path $Root "backend\.env"
if (-not (Test-Path $backendEnv)) {
    Copy-Item (Join-Path $Root "backend\.env.example") $backendEnv
    Write-Host "Created backend\.env - sesuaikan DB_PASSWORD jika MySQL Anda berbeda" -ForegroundColor Yellow
}

# Setup frontend .env
$frontendEnv = Join-Path $Root "frontend\.env"
if (-not (Test-Path $frontendEnv)) {
    Set-Content $frontendEnv "VITE_API_URL=http://localhost:5000/api"
}

Write-Host ""
Write-Host "Pastikan MySQL sudah jalan dan database 'silapor_kopo' ada." -ForegroundColor Yellow
Write-Host "XAMPP: start Apache+MySQL, buat DB via phpMyAdmin" -ForegroundColor Yellow
Write-Host ""
Write-Host "Migrasi database (jalankan sekali):" -ForegroundColor Green
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run migrate" -ForegroundColor White
Write-Host ""
Write-Host "Menjalankan backend + frontend di 2 jendela baru..." -ForegroundColor Green

$backendCmd = "Set-Location '$Root\backend'; npm run dev"
$frontendCmd = "Set-Location '$Root\frontend'; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "Admin:    admin@silapor.kopo / admin123" -ForegroundColor Cyan
