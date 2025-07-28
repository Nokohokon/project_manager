'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'
import { Settings, User, Bell, Database, Palette, Mail } from 'lucide-react'

interface UserSettings {
  id: string
  name: string
  email: string
  notifications: boolean
  autoSave: boolean
  theme: string
  language: string
  smtp_host?: string
  smtp_port?: string
  smtp_user?: string
  smtp_pass?: string
  smtp_from?: string
  imap_host?: string
  imap_port?: string
  imap_user?: string
  imap_pass?: string
  imap_secure?: string
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    id: '1',
    name: '',
    email: '',
    notifications: true,
    autoSave: true,
    theme: 'system',
    language: 'de'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Settings von der API laden
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true)
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            notifications: data.notifications === 'true',
            autoSave: data.autoSave === 'true',
            theme: data.theme || 'system',
            language: data.language || 'de',
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port || '587',
            smtp_user: data.smtp_user || '',
            smtp_pass: data.smtp_pass || '',
            smtp_from: data.smtp_from || '',
            imap_host: data.imap_host || '',
            imap_port: data.imap_port || '993',
            imap_user: data.imap_user || '',
            imap_pass: data.imap_pass || '',
            imap_secure: data.imap_secure || 'true'
          }))
        }
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.name,
          email: settings.email,
          notifications: settings.notifications.toString(),
          autoSave: settings.autoSave.toString(),
          theme: settings.theme,
          language: settings.language,
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_user: settings.smtp_user,
          smtp_pass: settings.smtp_pass,
          smtp_from: settings.smtp_from,
          imap_host: settings.imap_host,
          imap_port: settings.imap_port,
          imap_user: settings.imap_user,
          imap_pass: settings.imap_pass,
          imap_secure: settings.imap_secure
        }),
      })

      if (response.ok) {
        alert('Einstellungen erfolgreich gespeichert!')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern der Einstellungen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setSettings(prev => ({ ...prev, theme: newTheme }))
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/data/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('Daten erfolgreich exportiert!')
      } else {
        throw new Error('Fehler beim Export')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Fehler beim Datenexport.')
    }
  }

  const handleDeleteAllData = async () => {
    const confirmed = confirm(
      'ACHTUNG: Alle Daten (Projekte, Kontakte, Notizen, etc.) werden unwiderruflich gelöscht!\n\n' +
      'Diese Aktion kann NICHT rückgängig gemacht werden!\n\n' +
      'Sind Sie sich absolut sicher?'
    )
    
    if (confirmed) {
      const doubleConfirm = confirm('Letzte Warnung! Wirklich ALLE Daten löschen?')
      
      if (doubleConfirm) {
        try {
          setIsLoading(true)
          const response = await fetch('/api/data/export', {
            method: 'DELETE'
          })
          
          if (response.ok) {
            alert('Alle Daten wurden erfolgreich gelöscht.')
            // Seite neu laden um UI zu aktualisieren
            window.location.reload()
          } else {
            throw new Error('Fehler beim Löschen')
          }
        } catch (error) {
          console.error('Delete error:', error)
          alert('Fehler beim Löschen der Daten.')
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Einstellungen</h1>
      </div>

      {isLoadingSettings ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Lade Einstellungen...</p>
          </div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="email">E-Mail</TabsTrigger>
          <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="data">Daten</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Benutzerprofil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="language">Sprache</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sprache auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          {/* SMTP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP-Einstellungen (E-Mail versenden)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  placeholder="z.B. smtp.all-inkl.com"
                  value={settings.smtp_host || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  placeholder="587 (STARTTLS) oder 465 (SSL)"
                  value={settings.smtp_port || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="smtp_user">SMTP Benutzername</Label>
                <Input
                  id="smtp_user"
                  placeholder="Ihre E-Mail-Adresse"
                  value={settings.smtp_user || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="smtp_pass">SMTP Passwort</Label>
                <Input
                  id="smtp_pass"
                  type="password"
                  placeholder="Ihr E-Mail-Passwort"
                  value={settings.smtp_pass || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_pass: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="smtp_from">Absender-Adresse</Label>
                <Input
                  id="smtp_from"
                  placeholder="z.B. ihr-name@ihre-domain.de"
                  value={settings.smtp_from || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_from: e.target.value }))}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Häufige SMTP-Einstellungen:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>All-Inkl:</strong> smtp.all-inkl.com, Port 587</li>
                  <li><strong>Gmail:</strong> smtp.gmail.com, Port 587</li>
                  <li><strong>Outlook:</strong> smtp-mail.outlook.com, Port 587</li>
                  <li><strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* IMAP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                IMAP-Einstellungen (E-Mail empfangen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imap_host">IMAP Host</Label>
                <Input
                  id="imap_host"
                  placeholder="z.B. imap.all-inkl.com"
                  value={settings.imap_host || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, imap_host: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imap_port">IMAP Port</Label>
                <Input
                  id="imap_port"
                  placeholder="993 (SSL) oder 143 (STARTTLS)"
                  value={settings.imap_port || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, imap_port: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imap_user">IMAP Benutzername</Label>
                <Input
                  id="imap_user"
                  placeholder="Ihre E-Mail-Adresse"
                  value={settings.imap_user || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, imap_user: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imap_pass">IMAP Passwort</Label>
                <Input
                  id="imap_pass"
                  type="password"
                  placeholder="Ihr E-Mail-Passwort"
                  value={settings.imap_pass || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, imap_pass: e.target.value }))}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imap_secure">TLS/SSL verwenden</Label>
                <Select
                  value={settings.imap_secure || 'true'}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, imap_secure: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="TLS/SSL Einstellung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ja (empfohlen)</SelectItem>
                    <SelectItem value="false">Nein</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Häufige IMAP-Einstellungen:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>All-Inkl:</strong> imap.all-inkl.com, Port 993 (SSL)</li>
                  <li><strong>Gmail:</strong> imap.gmail.com, Port 993 (SSL)</li>
                  <li><strong>Outlook:</strong> outlook.office365.com, Port 993 (SSL)</li>
                  <li><strong>Yahoo:</strong> imap.mail.yahoo.com, Port 993 (SSL)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Erscheinungsbild
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Theme auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
                <Label htmlFor="auto-save">Automatisches Speichern</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
                <Label htmlFor="notifications">Desktop-Benachrichtigungen aktivieren</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Erhalten Sie Benachrichtigungen über neue Aufgaben, Termine und wichtige Updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Datenverwaltung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleExportData}>
                  Daten exportieren
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Daten importieren (Coming Soon)
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleDeleteAllData}
                  disabled={isLoading}
                >
                  {isLoading ? 'Lösche...' : 'Alle Daten löschen'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Achtung: Das Löschen aller Daten kann nicht rückgängig gemacht werden.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Speichern...' : 'Einstellungen speichern'}
          </Button>
        </div>
        </>
      )}
    </div>
  )
}
