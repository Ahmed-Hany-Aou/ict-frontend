@echo off
echo Fixing TypeScript cache issues...
cd "C:\MAMP\htdocs\project 29\ict-frontend"

echo Removing cache directories...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .parcel-cache rmdir /s /q .parcel-cache
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

echo Cache cleared!
echo.
echo Now restart your development server with: npm start
pause
