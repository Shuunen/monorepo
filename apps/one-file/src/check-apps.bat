@echo off
:loop
cls
call bun "%USERPROFILE%\Projects\github\monorepo\apps\one-file\check-apps.cli.js" "D:\Apps\\"
echo.
echo Press a key to re-run...
pause >nul
goto loop
