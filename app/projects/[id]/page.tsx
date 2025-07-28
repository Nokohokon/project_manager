'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  Save,
  Users,
  FileText,
  Clock,
  Calendar,
  BarChart3,
  Trash2
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: string
  priority: string
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  timeEntries?: TimeEntry[]
  contacts?: Contact[]
  notes?: Note[]
  documents?: Document[]
  tasks?: Task[]
  calendarEvents?: CalendarEvent[]
}

interface TimeEntry {
  id: string
  activity: string
  startTime: string
  endTime?: string
  duration?: number
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  company?: string
}

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
}

interface Document {
  id: string
  name: string
  size?: number
  createdAt: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority: string
  dueDate?: string
}

interface CalendarEvent {
  id: string
  title: string
  startDate: string
  type: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        setEditData({
          name: data.name,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : ''
        })
      } else if (response.status === 404) {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Fehler beim Laden des Projekts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        await loadProject()
        setIsEditing(false)
        alert('Projekt erfolgreich aktualisiert!')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern des Projekts.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Projekt wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          alert('Projekt gelöscht!')
          router.push('/projects')
        } else {
          throw new Error('Fehler beim Löschen')
        }
      } catch (error) {
        console.error('Fehler:', error)
        alert('Fehler beim Löschen des Projekts.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'on_hold': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const calculateTotalHours = () => {
    if (!project?.timeEntries) return 0
    return project.timeEntries.reduce((total, entry) => {
      return total + (entry.duration || 0)
    }, 0) / 60 // Convert minutes to hours
  }

  if (isLoading) {
    return <div className="p-6">Projekt wird geladen...</div>
  }

  if (!project) {
    return <div className="p-6">Projekt nicht gefunden.</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusColor(project.status)}>
                {project.status === 'active' ? 'Aktiv' : 
                 project.status === 'completed' ? 'Abgeschlossen' : 'Pausiert'}
              </Badge>
              <Badge variant={getPriorityColor(project.priority)}>
                {project.priority === 'high' ? 'Hoch' : 
                 project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Abbrechen
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Projekt bearbeiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="on_hold">Pausiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select
                  value={editData.priority}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Startdatum</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endDate">Enddatum (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arbeitszeit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(calculateTotalHours() * 10) / 10}h</div>
            <p className="text-xs text-muted-foreground">
              {project.timeEntries?.length || 0} Einträge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontakte</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.contacts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Zugeordnet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notizen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.notes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Erstellt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.calendarEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Geplant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="time">Zeiterfassung</TabsTrigger>
          <TabsTrigger value="contacts">Kontakte</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="events">Termine</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projektbeschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {project.description || 'Keine Beschreibung vorhanden.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projektinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Erstellt</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Zuletzt bearbeitet</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                {project.startDate && (
                  <div>
                    <p className="text-sm font-medium">Startdatum</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <p className="text-sm font-medium">Enddatum</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.endDate).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zeiteinträge</CardTitle>
              <CardDescription>Alle erfassten Arbeitszeiten für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              {project.timeEntries && project.timeEntries.length > 0 ? (
                <div className="space-y-3">
                  {project.timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{entry.activity}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.startTime).toLocaleString('de-DE')}
                          {entry.endTime && ` - ${new Date(entry.endTime).toLocaleString('de-DE')}`}
                        </p>
                      </div>
                      {entry.duration && (
                        <Badge variant="outline">
                          {Math.round(entry.duration / 60 * 10) / 10}h
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Zeiteinträge vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zugeordnete Kontakte</CardTitle>
              <CardDescription>Kontakte, die diesem Projekt zugeordnet sind</CardDescription>
            </CardHeader>
            <CardContent>
              {project.contacts && project.contacts.length > 0 ? (
                <div className="space-y-3">
                  {project.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                        {contact.email && (
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        )}
                        {contact.company && (
                          <p className="text-sm text-muted-foreground">{contact.company}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Kontakte zugeordnet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projektnotizen</CardTitle>
              <CardDescription>Notizen zu diesem Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              {project.notes && project.notes.length > 0 ? (
                <div className="space-y-3">
                  {project.notes.map((note) => (
                    <div key={note.id} className="p-3 border rounded">
                      <h4 className="font-medium mb-2">{note.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {note.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Notizen vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projektdokumente</CardTitle>
              <CardDescription>Dokumente zu diesem Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              {project.documents && project.documents.length > 0 ? (
                <div className="space-y-3">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size && `${Math.round(doc.size / 1024)} KB • `}
                          {new Date(doc.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Dokumente vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projekttermine</CardTitle>
              <CardDescription>Termine zu diesem Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              {project.calendarEvents && project.calendarEvents.length > 0 ? (
                <div className="space-y-3">
                  {project.calendarEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleString('de-DE')}
                        </p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Termine vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
