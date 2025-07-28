@echo off
cd /d "%~dp0"
title Project Management App
echo ==============================================
echo    PROJECT MANAGEMENT APP - STARTER
echo ==============================================
echo.

REM Prüfe ob Electron installiert ist
echo [1/3] Prüfe Electron-Installation...

if exist "node_modules\electron\dist\electron.exe" (
    echo    ✓ Electron gefunden in node_modules\electron\dist
    echo.
    echo [2/3] Starte Electron...
    "node_modules\electron\dist\electron.exe" electron\main.js
    goto :end
)

echo    ⚠ Electron nicht in node_modules gefunden
echo.
echo [2/3] Installiere Electron...
echo    → Führe npm install aus...

if exist "package.json" (
    npm install
    if %errorlevel% equ 0 (
        echo    ✓ Installation erfolgreich
        echo.
        echo [3/3] Starte Electron...
        if exist "node_modules\electron\dist\electron.exe" (
            "node_modules\electron\dist\electron.exe" electron\main.js
        ) else (
            echo    :x: Electron konnte nicht installiert werden
            goto :error
        )
    ) else (
        echo    :x: npm install fehlgeschlagen
        goto :error
    )
) else (
    echo    :x: package.json nicht gefunden
    goto :error
)

goto :end

:error
echo.
echo ===============================================
echo                FEHLER AUFGETRETEN
echo ===============================================
echo.
echo Die App konnte nicht gestartet werden.
echo.
echo Mögliche Lösungen:
echo 1. Stellen Sie sicher, dass Node.js installiert ist
echo 2. Führen Sie 'npm install' manuell in diesem Ordner aus
echo 3. Prüfen Sie Ihre Internetverbindung
echo 4. Versuchen Sie start-debug.bat für mehr Informationen
echo.
echo Aktueller Pfad: %CD%
echo.

:end
pause