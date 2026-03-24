@echo off
echo ==========================================
echo Deploy Supabase Edge Functions
echo ==========================================
echo.

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI not found!
    echo Please install it first:
    echo   npm install -g supabase
    echo.
    pause
    exit /b 1
)

echo [1/6] Deploying send-status-sms...
npx supabase functions deploy send-status-sms --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-status-sms deployment failed
    pause
    exit /b 1
)

echo.
echo [2/6] Deploying send-status-email...
npx supabase functions deploy send-status-email --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-status-email deployment failed
    pause
    exit /b 1
)

echo.
echo [3/6] Deploying send-nikah-sms...
npx supabase functions deploy send-nikah-sms --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-nikah-sms deployment failed
    pause
    exit /b 1
)

echo.
echo [4/6] Deploying send-nikah-email...
npx supabase functions deploy send-nikah-email --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-nikah-email deployment failed
    pause
    exit /b 1
)

echo.
echo [5/6] Deploying send-shahada-sms...
npx supabase functions deploy send-shahada-sms --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-shahada-sms deployment failed
    pause
    exit /b 1
)

echo.
echo [6/6] Deploying send-shahada-email...
npx supabase functions deploy send-shahada-email --project-ref olpvftgnmycofavltxoa
if %errorlevel% neq 0 (
    echo [FAILED] send-shahada-email deployment failed
    pause
    exit /b 1
)

echo.
echo ==========================================
echo All functions deployed successfully!
echo ==========================================
echo.
echo Next steps:
echo 1. Set your Pindo API token:
echo    npx supabase secrets set PINDO_API_TOKEN=your_token_here --project-ref olpvftgnmycofavltxoa

echo.
echo 2. Set your SMTP credentials (for email):
echo    npx supabase secrets set SMTP_EMAIL=your_email@gmail.com --project-ref olpvftgnmycofavltxoa

echo    npx supabase secrets set SMTP_APP_PASSWORD=your_app_password --project-ref olpvftgnmycofavltxoa
echo.
pause
