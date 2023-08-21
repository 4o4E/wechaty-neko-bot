@echo off

del /f /s /q dist > nul 2>&1
rd /q /s dist > nul 2>&1
cd .. && tsc && cd run && node dist/main.js