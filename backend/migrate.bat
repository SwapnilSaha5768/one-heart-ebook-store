@echo off
echo ==========================================
echo Oneheart Ebook - Database Migration Script
echo ==========================================

echo 1. Dumping local database 'ebookdb'...
echo (You may be asked for your LOCAL postgres password)
pg_dump -U postgres -d ebookdb -f dump.sql --clean --if-exists --no-owner --no-acl

if %errorlevel% neq 0 (
    echo [ERROR] Failed to dump database. 
    echo Please make sure:
    echo  - 'pg_dump' is in your PATH.
    echo  - Your local database is named 'ebookdb'.
    echo  - You have the correct permissions.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Restoring to Neon Tech...
echo (This might take a few seconds)
psql "postgresql://neondb_owner:npg_ekXdwq6R1oTl@ep-patient-hill-a1ltzqta-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" < dump.sql

if %errorlevel% neq 0 (
    echo [ERROR] Failed to restore database.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo Migration SUCCESSFUL!
echo ==========================================
pause
