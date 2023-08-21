@echo off
del /f /s /q dist >nul 2>&1
rd /q /s dist >nul 2>&1
npx tsc & node dist/main.js