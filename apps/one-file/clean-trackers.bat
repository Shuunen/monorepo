@echo off

powershell -c "(New-Object Media.SoundPlayer 'windows-xp-notify.wav').PlaySync();"

bun "%USERPROFILE%\Projects\github\monorepo\apps\one-file\clean-trackers.cli.js" > "%USERPROFILE%\Projects\github\monorepo\apps\one-file\clean-trackers.log"

