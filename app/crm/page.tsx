'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Edit, Trash2, Building, Mail, Phone, Search, Send } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  notes?: string
  projectId?: string
  project?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
}

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailingContact, setEmailingContact] = useState<Contact | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    notes: '',
    projectId: 'none'
  })

  const [emailData, setEmailData] = useState({
    subject: '',
    content: ''
  })

  useEffect(() => {
    loadContacts()
    loadProjects()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Projekte:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'
      const method = editingContact ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        resetForm()
        loadContacts()
        alert(editingContact ? 'Kontakt aktualisiert!' : 'Kontakt erstellt!')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern des Kontakts.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailingContact?.email) {
      alert('Kontakt hat keine E-Mail-Adresse!')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        to: emailingContact.email,
        subject: emailData.subject,
        body: emailData.content, // <-- body statt content
        contactId: emailingContact.id,
        projectId: emailingContact.projectId
      }),
      })

      if (response.ok) {
        resetEmailForm()
        alert('E-Mail erfolgreich gesendet!')
      } else {
        throw new Error('Fehler beim Senden')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Senden der E-Mail.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      position: contact.position || '',
      notes: contact.notes || '',
      projectId: contact.projectId || ''
    })
    setShowForm(true)
  }

  const handleEmail = (contact: Contact) => {
    setEmailingContact(contact)
    setEmailData({
      subject: '',
      content: ''
    })
    setShowEmailForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Kontakt wirklich löschen?')) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadContacts()
          alert('Kontakt gelöscht!')
        } else {
          throw new Error('Fehler beim Löschen')
        }
      } catch (error) {
        console.error('Fehler:', error)
        alert('Fehler beim Löschen des Kontakts.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      notes: '',
      projectId: ''
    })
    setEditingContact(null)
    setShowForm(false)
  }

  const resetEmailForm = () => {
    setEmailData({
      subject: '',
      content: ''
    })
    setEmailingContact(null)
    setShowEmailForm(false)
  }

  const filteredContacts = contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName} ${contact.company} ${contact.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">CRM - Kontakte</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Kontakt
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kontakte durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingContact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Unternehmen</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectId">Projekt</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Projekt</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Speichern...' : (editingContact ? 'Aktualisieren' : 'Erstellen')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Email Form */}
      {showEmailForm && emailingContact && (
        <Card>
          <CardHeader>
            <CardTitle>
              E-Mail an {emailingContact.firstName} {emailingContact.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="emailTo">An</Label>
                <Input
                  id="emailTo"
                  value={emailingContact.email || ''}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="emailSubject">Betreff</Label>
                <Input
                  id="emailSubject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="emailContent">Nachricht</Label>
                <Textarea
                  id="emailContent"
                  value={emailData.content}
                  onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Senden...' : 'E-Mail senden'}
                </Button>
                <Button type="button" variant="outline" onClick={resetEmailForm}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contact List */}
      <div className="grid gap-4">
        {isLoading && !showForm && !showEmailForm ? (
          <div>Kontakte werden geladen...</div>
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Keine Kontakte gefunden.' : 'Noch keine Kontakte vorhanden.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.company && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-1" />
                        {contact.company}
                        {contact.position && ` - ${contact.position}`}
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.project && (
                      <div className="text-sm text-blue-600">
                        Projekt: {contact.project.name}
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {contact.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmail(contact)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}