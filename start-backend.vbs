Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd Backend && node server.js", 0, False
