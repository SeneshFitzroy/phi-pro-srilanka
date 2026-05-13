@echo off
REM ============================================================================
REM PHI-PRO — One-shot Firebase deploy (rules + indexes + storage + seed)
REM Run from anywhere:  scripts\firebase-deploy-all.bat
REM ============================================================================
setlocal
cd /d "%~dp0\.."

echo.
echo ==^> Checking firebase-tools...
where firebase >nul 2>nul
if errorlevel 1 (
    echo     firebase CLI not found - installing globally...
    call npm install -g firebase-tools
)
call firebase --version

echo.
echo ==^> Verifying login...
call firebase projects:list >nul 2>nul
if errorlevel 1 (
    echo     Not logged in - opening browser...
    call firebase login
)

echo.
echo ==^> Deploying Firestore rules...
call firebase deploy --only firestore:rules --project pusl3190-phi-pro-system
if errorlevel 1 goto fail

echo.
echo ==^> Deploying Firestore indexes...
call firebase deploy --only firestore:indexes --project pusl3190-phi-pro-system
if errorlevel 1 goto fail

echo.
echo ==^> Deploying Storage rules...
call firebase deploy --only storage --project pusl3190-phi-pro-system
if errorlevel 1 goto fail

echo.
echo ==^> Seeding demo accounts (idempotent)...
call node scripts\seed-users.mjs
if errorlevel 1 goto fail

echo.
echo ==^> Seeding public data (idempotent)...
call node scripts\seed-public-data.mjs
if errorlevel 1 goto fail

echo.
echo ============================================================
echo   Firebase deploy complete.
echo   Console: https://console.firebase.google.com/project/pusl3190-phi-pro-system/overview
echo ============================================================
exit /b 0

:fail
echo.
echo *** Deploy step failed - see error above ***
exit /b 1
