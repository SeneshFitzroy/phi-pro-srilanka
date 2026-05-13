# =============================================================================
# PHI-PRO — One-shot Firebase deploy (rules + indexes + storage)
# Project: pusl3190-phi-pro-system  (already pinned in .firebaserc)
#
# Usage:
#   1) pwsh ./scripts/firebase-deploy-all.ps1           # interactive login (one-time)
#   2) re-run anytime — login is cached by the CLI
#
# Requires: Node 20+, firebase-tools (auto-installed if missing).
# =============================================================================

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

Write-Host "==> Checking firebase-tools..." -ForegroundColor Cyan
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
  Write-Host "    firebase CLI not found — installing globally..." -ForegroundColor Yellow
  npm install -g firebase-tools
}
firebase --version

Write-Host ""
Write-Host "==> Verifying login..." -ForegroundColor Cyan
$projects = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "    Not logged in — opening browser..." -ForegroundColor Yellow
  firebase login
}

Write-Host ""
Write-Host "==> Deploying Firestore rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules --project pusl3190-phi-pro-system

Write-Host ""
Write-Host "==> Deploying Firestore indexes..." -ForegroundColor Cyan
firebase deploy --only firestore:indexes --project pusl3190-phi-pro-system

Write-Host ""
Write-Host "==> Deploying Storage rules..." -ForegroundColor Cyan
firebase deploy --only storage --project pusl3190-phi-pro-system

Write-Host ""
Write-Host "==> Seeding demo accounts (idempotent)..." -ForegroundColor Cyan
node scripts/seed-users.mjs

Write-Host ""
Write-Host "==> Seeding public data (idempotent)..." -ForegroundColor Cyan
node scripts/seed-public-data.mjs

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Firebase deploy complete." -ForegroundColor Green
Write-Host "  Console: https://console.firebase.google.com/project/pusl3190-phi-pro-system/overview" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
