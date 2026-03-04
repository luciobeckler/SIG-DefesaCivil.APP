@echo off
echo ===================================================
echo     GERADOR AUTOMATICO DE APK - SIG DEFESA CIVIL
echo ===================================================

echo.
echo [1/5] Compilando o projeto Angular (Web)...
call ionic build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha na compilacao web!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/5] Sincronizando com o Capacitor (Android)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha na sincronizacao do Capacitor!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/5] Limpando o cache do Gradle...
cd android
call gradlew.bat clean

echo.
echo [4/5] Construindo o APK Nativo...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha na construcao do APK pelo Gradle!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [5/5] Movendo o APK para a pasta principal...
if not exist "meu_apk" mkdir "meu_apk"

:: Captura a data e hora atual do Windows para criar um nome unico
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%b%%a)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)
set mytime=%mytime: =0%

set NOME_ARQUIVO=SIG-DefesaCivil_%mydate%_%mytime%.apk

copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "meu_apk\%NOME_ARQUIVO%"

echo.
echo ===================================================
echo   SUCESSO! O seu APK esta na pasta 'meu_apk'.
echo ===================================================
pause
