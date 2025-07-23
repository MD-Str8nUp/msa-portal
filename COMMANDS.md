# MSA Portal - Individual Commands for Windows PowerShell
# Copy and paste these commands one by one in PowerShell

# === STEP 1: KILL ALL NODE PROCESSES ===
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name next-dev-server -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill any process using port 3000
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    $pid = ($port3000 -split '\s+')[-1]
    if ($pid -and $pid -ne "0") {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# === STEP 2: NAVIGATE TO PROJECT ===
Set-Location "c:\Users\zaina\OneDrive\Documents\GitHub\msa-portal"

# === STEP 3: CLEAR CACHES ===
# Clear Next.js cache
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# Clear npm cache
npm cache clean --force

# Clear node_modules
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }

# === STEP 4: FRESH INSTALL ===
npm install

# === STEP 5: START SERVER ===
npm run dev

# === ALTERNATIVE: Use VS Code Task ===
# Instead of npm run dev, you can use the VS Code task:
# Ctrl+Shift+P -> "Tasks: Run Task" -> "Start Scout Management System"
