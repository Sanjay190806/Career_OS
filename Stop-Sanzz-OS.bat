@echo off
title Sanzz OS Tracker Stopper
echo ========================================
echo Stopping Sanzz OS Tracker Servers...
echo ========================================

echo.
echo Stopping Node.js processes...
taskkill /F /IM node.exe /T 2>nul

echo.
echo Closing command prompt instances...
taskkill /FI "WINDOWTITLE eq Sanzz OS Backend*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Sanzz OS Frontend*" /T /F 2>nul

echo.
echo ========================================
echo Sanzz OS Tracker has been stopped.
echo ========================================
timeout /t 3 > nul
