'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, Calendar, Users } from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  deadline?: string
  createdAt: string
  _count: {
    timeEntries: number
    notes: number
    documents: number
    tasks: number
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

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
          <h1 className="text-3xl font-bold">Projekte</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Projekte und deren Fortschritt
          </p>
        </div>
        <Button asChild>
          <a href="/projects/create">
            <Plus className="h-4 w-4 mr-2" />
            Neues Projekt
          </a>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Projekte</h3>
            <p className="text-muted-foreground mb-6">
              Erstellen Sie Ihr erstes Projekt, um loszulegen
            </p>
            <Button asChild>
              <a href="/projects/create">
                <Plus className="h-4 w-4 mr-2" />
                Erstes Projekt erstellen
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {project.name}
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {project.description || 'Keine Beschreibung'}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Erstellt: {new Date(project.createdAt).toLocaleDateString('de-DE')}</div>
                    {project.deadline && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Deadline: {new Date(project.deadline).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{project._count.timeEntries}</div>
                    <div className="text-muted-foreground">Zeiteinträge</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{project._count.tasks}</div>
                    <div className="text-muted-foreground">Aufgaben</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{project._count.notes}</div>
                    <div className="text-muted-foreground">Notizen</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{project._count.documents}</div>
                    <div className="text-muted-foreground">Dokumente</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/projects/${project.id}`}>
                      Details
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/projects/${project.id}`}>
                      Bearbeiten
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
