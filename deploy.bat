@echo off
echo.
echo  ===================================
echo   FinanzApp - Deploy a Netlify
echo  ===================================
echo.

cd /d "%~dp0"

echo  [1/2] Compilando la app...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Fallo la compilacion. Revisa los errores arriba.
    pause
    exit /b 1
)

echo.
echo  [2/2] Compilacion exitosa!
echo.
echo  Abre Netlify y arrastra la carpeta dist:
echo  %~dp0dist
echo.
explorer "%~dp0dist"
start https://app.netlify.com

echo.
echo  Cuando termines de subir en Netlify, presiona cualquier tecla.
pause
