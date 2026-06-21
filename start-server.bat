@echo off
echo ==============================================
echo        OPC/Harness System Launcher
echo ==============================================
echo.
echo Starting server...
echo.

cd /d "D:\Projects\Trae_CN\opc-harness-system"

echo Current directory: %cd%
echo.

node server.js

echo.
echo Server stopped.
pause