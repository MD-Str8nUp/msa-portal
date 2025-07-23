# MSA Portal - Clean Rebuild Commands for Windows
# Run these commands in PowerShell one by one

## 1. Kill all Node processes and free up ports
Write-Host "🔄 Killing all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name next-dev-server -ErrorAction SilentlyContinue | Stop-Process -Force

# Check if port 3000 is still in use and kill it
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    $processId = ($port3000 -split '\s+')[-1]
    if ($processId -and $processId -ne "0") {
        Write-Host "🔄 Killing process on port 3000 (PID: $processId)" -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ All Node processes killed" -ForegroundColor Green

## 2. Navigate to project directory
Write-Host "🔄 Navigating to project directory..." -ForegroundColor Yellow
Set-Location "c:\Users\zaina\OneDrive\Documents\GitHub\msa-portal"
Write-Host "✅ In project directory: $(Get-Location)" -ForegroundColor Green

## 3. Clear all caches
Write-Host "🔄 Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
Write-Host "✅ .next directory cleared" -ForegroundColor Green

Write-Host "🔄 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "🔄 Clearing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
Write-Host "✅ node_modules cleared" -ForegroundColor Green

## 4. Fresh install
Write-Host "🔄 Installing dependencies..." -ForegroundColor Yellow
npm install

## 5. Verify environment
Write-Host "🔄 Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local missing" -ForegroundColor Red
}

## 6. Build and start
Write-Host "🔄 Starting development server..." -ForegroundColor Yellow
npm run dev
