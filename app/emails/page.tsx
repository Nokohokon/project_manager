'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mail, Send, Inbox, RefreshCw, FolderOpen } from 'lucide-react'

interface Email {
  id: string
  from: string
  subject: string
  date: string
  body: string
  folder: string
  read: boolean
}

interface Folder {
  value: string
  label: string
  count?: number
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX')
  const [loading, setLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: ''
  })

  // Ordner laden beim Start
  useEffect(() => {
    loadFolders()
  }, [])

  // E-Mails laden wenn Ordner gewechselt wird
  useEffect(() => {
    if (selectedFolder) {
      loadEmails()
    }
  }, [selectedFolder])

  const loadFolders = async () => {
    try {
      console.log('Lade Ordner...')
      const response = await fetch('/api/emails/folders')
      const data = await response.json()
      
      if (data.success && data.folders) {
        setFolders(data.folders)
        console.log('Ordner geladen:', data.folders)
      } else {
        console.error('Fehler beim Laden der Ordner:', data.error)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ordner:', error)
    }
  }

  const loadEmails = async () => {
    setLoading(true)
    try {
      console.log(`Lade E-Mails aus Ordner: ${selectedFolder}`)
      
      let allEmails: Email[] = []
      
      // Alle E-Mails nur von IMAP laden
      try {
        const imapResponse = await fetch(`/api/emails/receive?folder=${encodeURIComponent(selectedFolder)}`)
        const imapData = await imapResponse.json()
        
        if (imapData.success && imapData.emails) {
          allEmails = imapData.emails
          console.log(`${allEmails.length} E-Mails von IMAP geladen`)
        }
      } catch (imapError) {
        console.error('Fehler beim Laden der IMAP-E-Mails:', imapError)
      }
      
      setEmails(allEmails)
      console.log(`${allEmails.length} E-Mails aus ${selectedFolder} geladen`)
    } catch (error) {
      console.error('Fehler beim Laden der E-Mails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!newEmail.to || !newEmail.subject) {
      alert('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setSendLoading(true)
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmail),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('E-Mail erfolgreich gesendet!')
        setNewEmail({ to: '', subject: '', body: '' })
        // Ordner und E-Mails neu laden, um die gesendete E-Mail anzuzeigen
        loadFolders()
        // Wenn wir im Gesendet-Ordner sind, sofort neu laden
        if (selectedFolder === 'Sent' || selectedFolder === 'INBOX.Sent' || selectedFolder === 'SENT' || selectedFolder === 'Gesendet' || selectedFolder === 'INBOX.Gesendet') {
          loadEmails()
        }
      } else {
        alert(`Fehler beim Senden: ${data.error}`)
      }
    } catch (error) {
      console.error('Fehler beim Senden:', error)
      alert('Fehler beim Senden der E-Mail')
    } finally {
      setSendLoading(false)
    }
  }

  const getFolderDisplayName = (folderName: string) => {
    const folder = folders.find(f => f.value === folderName)
    return folder?.label || folderName
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">E-Mails</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Neue E-Mail
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue E-Mail schreiben</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to">An *</Label>
                  <Input
                    id="to"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                    placeholder="empfaenger@beispiel.de"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input
                    id="subject"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                    placeholder="E-Mail Betreff"
                  />
                </div>
                <div>
                  <Label htmlFor="body">Nachricht</Label>
                  <Textarea
                    id="body"
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                    placeholder="Ihre Nachricht..."
                    rows={10}
                  />
                </div>
                <Button 
                  onClick={sendEmail} 
                  disabled={sendLoading}
                  className="w-full"
                >
                  {sendLoading ? 'Wird gesendet...' : 'E-Mail senden'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Ordner-Auswahl und Aktionen */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <Label>Ordner:</Label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordner wählen" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.value} value={folder.value}>
                  {folder.label}
                  {folder.count !== undefined && ` (${folder.count})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={loadEmails} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Lädt...' : 'Nachrichten abrufen'}
        </Button>
      </div>

      {/* E-Mail-Liste */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Lade E-Mails aus {getFolderDisplayName(selectedFolder)}...</p>
            </CardContent>
          </Card>
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                Keine E-Mails in {getFolderDisplayName(selectedFolder)} gefunden
              </p>
            </CardContent>
          </Card>
        ) : (
          emails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{email.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Von: {email.from}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary">
                      {getFolderDisplayName(email.folder)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(email.date).toLocaleDateString('de-DE')}
                    </span>
                    {!email.read && (
                      <Badge variant="default">Neu</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto bg-muted p-3 rounded">
                  {email.body}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
