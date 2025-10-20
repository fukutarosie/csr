@echo off
title BACKEND SERVER - Port 8000
color 0A
cd src
echo.
echo ========================================
echo   BACKEND SERVER STARTING
echo ========================================
echo.
call venv\Scripts\activate.bat
python main.py
pause


