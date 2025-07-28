'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar as CalendarIcon, 
  Plus,
  Clock,
  Users,
  Edit,
  Trash2
} from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  allDay: boolean
  type: string
  projectId?: string
  project?: {
    id: string
    name: string
  }
}

interface Project {
  id: string
  name: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    projectId: 'none'
  })

  useEffect(() => {
    loadEvents()
    loadProjects()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/calendar')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error)
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
      const url = editingEvent ? `/api/calendar/${editingEvent.id}` : '/api/calendar'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId === 'none' ? null : formData.projectId
        }),
      })

      if (response.ok) {
        loadEvents()
        setShowForm(false)
        setEditingEvent(null)
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          type: 'meeting',
          projectId: 'none'
        })
        alert(editingEvent ? 'Event aktualisiert!' : 'Event erstellt!')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern des Events.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    
    // Format datetime-local values properly
    const formatForDatetimeLocal = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: formatForDatetimeLocal(event.startTime),
      endTime: event.endTime ? formatForDatetimeLocal(event.endTime) : '',
      type: event.type,
      projectId: event.projectId || 'none'
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Event wirklich löschen?')) {
      try {
        const response = await fetch(`/api/calendar/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadEvents()
          alert('Event gelöscht!')
        } else {
          throw new Error('Fehler beim Löschen')
        }
      } catch (error) {
        console.error('Fehler:', error)
        alert('Fehler beim Löschen des Events.')
      }
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'default'
      case 'deadline': return 'destructive'
      case 'review': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground mt-2">
            Planen Sie Termine und behalten Sie Deadlines im Blick
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Termin
        </Button>
      </div>

      {/* Event Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? 'Event bearbeiten' : 'Neues Event'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Startzeit</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Endzeit (optional)</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="project">Projekt (optional)</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen" />
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

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Speichern...' : editingEvent ? 'Aktualisieren' : 'Erstellen'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingEvent(null)
                    setFormData({
                      title: '',
                      description: '',
                      startTime: '',
                      endTime: '',
                      type: 'meeting',
                      projectId: 'none'
                    })
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center">Lade Events...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Termine vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihren ersten Kalendertermin
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Termin
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={getEventTypeColor(event.type)}>
                        {event.type === 'meeting' && 'Meeting'}
                        {event.type === 'deadline' && 'Deadline'}
                        {event.type === 'review' && 'Review'}
                        {event.type === 'event' && 'Event'}
                      </Badge>
                      {event.project && (
                        <Badge variant="outline">
                          {event.project.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(event.startTime).toLocaleString('de-DE')}
                        {event.endTime && (
                          <>
                            {' - '}
                            {new Date(event.endTime).toLocaleString('de-DE')}
                          </>
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
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
