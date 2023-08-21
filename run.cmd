@echo off

del /f /s /q dist > nul 2>&1
rd /q /s dist > nul 2>&1
mkdir run >nul 2>&1
set NEKO_BOT_DIR=run
tsc && node dist/main.js