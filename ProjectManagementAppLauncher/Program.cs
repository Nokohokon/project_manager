using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace ProjectManagementAppLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string vbsPath = Path.Combine(baseDir, "ProjectManagementApp.vbs");
            string jsPath = Path.Combine(baseDir, "start-electron.js");

            if (File.Exists(vbsPath))
            {
                var psi = new ProcessStartInfo("wscript.exe", '"' + vbsPath + '"') { UseShellExecute = true, CreateNoWindow = true };
                using (var proc = Process.Start(psi))
                {
                    if (proc != null)
                        proc.WaitForExit();
                }
            }
            else if (File.Exists(jsPath))
            {
                var psi = new ProcessStartInfo("node", '"' + jsPath + '"') { UseShellExecute = true, CreateNoWindow = true };
                using (var proc = Process.Start(psi))
                {
                    if (proc != null)
                        proc.WaitForExit();
                }
            }
            else
            {
                MessageBox.Show("Keine Startdatei gefunden!", "Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
