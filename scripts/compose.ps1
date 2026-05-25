# Jalankan docker-compose dengan Podman ATAU Docker (tanpa Docker Desktop wajib)
param(
    [Parameter(Position = 0)]
    [string]$Command = "up -d --build"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$runner = $null
if (Get-Command podman -ErrorAction SilentlyContinue) {
    $v = podman compose version 2>$null
    if ($LASTEXITCODE -eq 0) { $runner = "podman" }
}
if (-not $runner -and (Get-Command docker -ErrorAction SilentlyContinue)) {
    docker version --format "{{.Server.Version}}" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $runner = "docker" }
}

if (-not $runner) {
    Write-Host ""
    Write-Host "Tidak ada Podman/Docker yang jalan." -ForegroundColor Red
    Write-Host ""
    Write-Host "Pilih salah satu:" -ForegroundColor Yellow
    Write-Host "  1. Install Podman Desktop: https://podman-desktop.io" -ForegroundColor White
    Write-Host "  2. Dev tanpa container: npm run dev" -ForegroundColor White
    Write-Host "  3. Bukti Docker via GitHub: push repo, cek Actions workflow docker-build.yml" -ForegroundColor White
    exit 1
}

Write-Host "Menggunakan: $runner compose $Command" -ForegroundColor Cyan
Invoke-Expression "$runner compose $Command"
