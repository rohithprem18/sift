# Starts Sift's backend (:8080) and frontend (:5173) together, each in its
# own window, reading SERPER_API_KEY from .env at the repo root.

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=\s][^=]*)\s*=\s*(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
} else {
    Write-Warning ".env not found at $envFile - SERPER_API_KEY may be unset."
}

if (-not $env:SERPER_API_KEY) {
    Write-Warning "SERPER_API_KEY is empty. Set it in .env or export it before running this script."
}

Write-Host "Starting backend on :8080 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$root\backend'; `$env:SERPER_API_KEY='$env:SERPER_API_KEY'; ./mvnw spring-boot:run"
)

Write-Host "Starting frontend on :5173 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$root\frontend'; npm run dev"
)

Write-Host ""
Write-Host "Backend:  http://localhost:8080/api/health"
Write-Host "Frontend: http://localhost:5173 (use this one while developing)"

