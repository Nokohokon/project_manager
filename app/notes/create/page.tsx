'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, FileText } from 'lucide-react'

interface Project {
  id: string
  name: string
}

export default function CreateNotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    projectId: 'none'
  })

  useEffect(() => {
    loadProjects()
  }, [])

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
    setLoading(true)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId === 'none' ? null : formData.projectId
        }),
      })

      if (response.ok) {
        router.push('/notes')
      } else {
        console.error('Failed to create note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Neue Notiz erstellen</h1>
          <p className="text-muted-foreground mt-2">
            Halten Sie Ihre Gedanken und Ideen fest
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notiz Details
          </CardTitle>
          <CardDescription>
            Erstellen Sie eine neue Notiz für Ihre Projekte oder persönlichen Gedanken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="z.B. Meeting Notizen, Ideen, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Inhalt *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Schreiben Sie hier Ihre Notiz..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="z.B. wichtig, idee, meeting"
              />
              <p className="text-xs text-muted-foreground">
                Trennen Sie mehrere Tags mit Kommas
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || !formData.title.trim() || !formData.content.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Speichere...' : 'Notiz speichern'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
