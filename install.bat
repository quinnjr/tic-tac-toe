@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Node.js 20 Installer for Windows
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Set variables
set NODEJS_VERSION=20.18.0
set DOWNLOAD_URL=https://nodejs.org/dist/v%NODEJS_VERSION%/node-v%NODEJS_VERSION%-x64.msi
set TEMP_DIR=%TEMP%\nodejs_installer
set MSI_FILE=%TEMP_DIR%\nodejs-installer.msi

:: Create temp directory
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo Checking if Node.js is already installed...
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo Node.js is already installed:
    node --version
    echo npm version:
    npm --version
    echo.
    set /p CONTINUE="Do you want to continue with installation anyway? (y/N): "
    if /i "!CONTINUE!" neq "y" (
        echo Installation cancelled.
        pause
        exit /b 0
    )
)

echo.
echo Downloading Node.js v%NODEJS_VERSION%...
echo From: %DOWNLOAD_URL%
echo To: %MSI_FILE%
echo.

:: Download using PowerShell (works on Windows 7+)
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MSI_FILE%'}"

if %errorLevel% neq 0 (
    echo ERROR: Failed to download Node.js installer
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

if not exist "%MSI_FILE%" (
    echo ERROR: Downloaded file not found
    pause
    exit /b 1
)

echo.
echo Download completed successfully!
echo Installing Node.js...
echo.

:: Install Node.js silently
msiexec /i "%MSI_FILE%" /quiet /norestart

if %errorLevel% neq 0 (
    echo ERROR: Installation failed with error code %errorLevel%
    echo You may need to run the installer manually: %MSI_FILE%
    pause
    exit /b 1
)

echo.
echo Installation completed!
echo.

:: Refresh environment variables
echo Refreshing environment variables...
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SystemPath=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "UserPath=%%b"
set "PATH=%SystemPath%;%UserPath%"

:: Clean up
echo Cleaning up temporary files...
del "%MSI_FILE%" >nul 2>&1
rmdir "%TEMP_DIR%" >nul 2>&1

echo.
echo ========================================
echo Installation Summary
echo ========================================

:: Verify installation
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Node.js installed successfully
    for /f "tokens=*" %%a in ('node --version 2^>nul') do echo   Version: %%a

    where npm >nul 2>&1
    if !errorLevel! equ 0 (
        echo ✓ npm installed successfully
        for /f "tokens=*" %%a in ('npm --version 2^>nul') do echo   Version: %%a
    ) else (
        echo ✗ npm not found in PATH
    )
) else (
    echo ✗ Node.js installation verification failed
    echo You may need to restart your command prompt or computer
)

echo.
echo NOTE: You may need to restart your command prompt
echo or computer for PATH changes to take effect.
echo.

pause