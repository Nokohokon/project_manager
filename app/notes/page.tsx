'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  FileText, 
  Search,
  Calendar,
  Tag
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  tags?: string
  createdAt: string
  project?: {
    name: string
  }
}

interface Project {
  id: string
  name: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, projectsRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/projects')
        ])

        if (notesRes.ok) {
          const notesData = await notesRes.json()
          setNotes(notesData)
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProject === 'all' || 
                          (note.project && selectedProject === 'project') ||
                          (!note.project && selectedProject === 'personal')
    return matchesSearch && matchesProject
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notizen</h1>
          <p className="text-muted-foreground mt-2">
            Organisieren Sie Ihre Gedanken und Ideen
          </p>
        </div>
        <Button asChild>
          <a href="/notes/create">
            <Plus className="h-4 w-4 mr-2" />
            Neue Notiz
          </a>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Notizen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Notizen</SelectItem>
                <SelectItem value="personal">Persönliche Notizen</SelectItem>
                <SelectItem value="project">Projekt-Notizen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Keine Notizen gefunden</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Keine Notizen entsprechen Ihrer Suche' : 'Erstellen Sie Ihre erste Notiz'}
            </p>
            <Button asChild>
              <a href="/notes/create">
                <Plus className="h-4 w-4 mr-2" />
                Erste Notiz erstellen
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  {note.project && (
                    <Badge variant="secondary" className="ml-2">
                      {note.project.name}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString('de-DE')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {note.content}
                </p>
                {note.tags && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {note.tags}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
