#include <windows.h>

int main() {
    // Pfad zum VBS-Skript (im selben Verzeichnis wie die EXE)
    const char* vbsFile = "ProjectManagementApp.vbs";
    // Befehl zum Ausführen des VBS-Skripts
    char command[512];
    snprintf(command, sizeof(command), "wscript \"%s\"", vbsFile);
    // Das Skript im Hintergrund starten
    WinExec(command, SW_HIDE);
    return 0;
}
