# scripts/dev.ps1
# One-command launcher for EduPathAI local development.
# Starts backend (uvicorn) + frontend (Next.js) + opens the browser.

$ErrorActionPreference = 'Stop'

# Resolve repo root (parent of this script's folder)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir

Write-Host ""
Write-Host "EduPathAI dev launcher" -ForegroundColor Cyan
Write-Host "  repo root: $Root" -ForegroundColor DarkGray
Write-Host ""

# --- Pre-flight checks -------------------------------------------------
$venvActivate = Join-Path $Root ".venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvActivate)) {
    Write-Host "ERROR: venv not found at $venvActivate" -ForegroundColor Red
    Write-Host "       Run: py -3.11 -m venv .venv" -ForegroundColor Yellow
    exit 1
}

$webDir = Join-Path $Root "web"
if (-not (Test-Path (Join-Path $webDir "package.json"))) {
    Write-Host "ERROR: web/package.json not found at $webDir" -ForegroundColor Red
    exit 1
}

# --- Start backend in new window --------------------------------------
Write-Host "[1/3] Starting backend (uvicorn on port 8000)..." -ForegroundColor Yellow
$backendCmd = "Set-Location '$Root'; & '$venvActivate'; uvicorn services.api.server:app --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList @('-NoExit', '-Command', $backendCmd)

# --- Start frontend in new window -------------------------------------
Write-Host "[2/3] Starting frontend (Next.js on port 3000)..." -ForegroundColor Yellow
$frontendCmd = "Set-Location '$webDir'; npm run dev"
Start-Process powershell -ArgumentList @('-NoExit', '-Command', $frontendCmd)

# --- Wait for backend health ------------------------------------------
Write-Host "[3/3] Waiting for backend to become healthy..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 2
        if ($resp.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # keep polling
    }
}

if ($healthy) {
    Write-Host "  Backend healthy (took ${i}s)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: backend did not respond within 20s. Check the backend window." -ForegroundColor Red
}

# --- Wait for Next.js first compile -----------------------------------
Write-Host "  Waiting 8s for Next.js to compile..." -ForegroundColor DarkGray
Start-Sleep -Seconds 8

# --- Open browser -----------------------------------------------------
Write-Host ""
Write-Host "Opening http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Dev environment running" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Backend : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  To stop: close the two spawned PowerShell windows" -ForegroundColor DarkGray
Write-Host ""
