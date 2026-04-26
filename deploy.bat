@echo off
cd /d "%~dp0"
echo ========================================
echo   BVPSolver - Build and Deploy
echo ========================================

echo.
echo [1/4] Building web app...
call npx expo export -p web
if %errorlevel% neq 0 (echo Build failed! && pause && exit /b 1)

echo.
echo [2/4] Generating PWA icons...
call sharp -i assets/icon.svg -o dist/icon-192.png resize 192 192
call sharp -i assets/icon.svg -o dist/icon-512.png resize 512 512
call sharp -i assets/icon.svg -o dist/apple-touch-icon.png resize 180 180

echo.
echo [3/4] Applying PWA patch...
call node scripts/patch-web.js

echo.
echo [4/4] Deploying to Netlify...
call npx netlify-cli deploy --dir dist --prod ^
  --auth nfp_t6UWP478LPKsEdPTvWsw8oiJLBD8p6kBa582 ^
  --site b2cee7b3-f730-4eef-b9e8-c22f9fa1e20c

echo.
echo ========================================
echo   Deploy complete!
echo   https://harmonious-otter-e9266f.netlify.app
echo ========================================
pause
