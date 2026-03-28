@echo off
title 🏎️ TESTA MY PI CAR
echo ====================================================
echo    🏎️  STARTAR TEST-SERVER FÖR MY PI CAR  🏎️
echo ====================================================
echo.

:: Gå till mappen där servern ligger
cd /d "%~dp0server"

:: Testa om Node fungerar
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [FEL] Node.js hittades inte! Installera det från nodejs.org
    pause
    exit /b
)

:: Installera om det behövs
if not exist node_modules (
    echo [1/2] 📦 Installerar Express/WS...
    npm install
) else (
    echo [1/2] ✅ Filer redan installerade.
)

echo [2/2] 🚀 Startar servern...
echo.
echo DIN IP-ADRESS (Skriv i mobilen):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"IPv4-adress"') do (
    echo    >>>  http:%%a:3000  <<<
)
echo.

node index.js
pause
