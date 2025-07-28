'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Upload, Download, Trash2, Search, FolderOpen } from 'lucide-react'

interface Document {
  id: string
  name: string
  path: string
  size?: number
  mimeType?: string
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')
  const [uploadProject, setUploadProject] = useState('none')

  useEffect(() => {
    loadDocuments()
    loadProjects()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dokumente:', error)
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (uploadProject && uploadProject !== 'none') {
        formData.append('projectId', uploadProject)
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        loadDocuments()
        alert('Dokument erfolgreich hochgeladen!')
        // Reset file input
        event.target.value = ''
        setUploadProject('')
      } else {
        throw new Error('Fehler beim Hochladen')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Hochladen des Dokuments.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Dokument wirklich löschen?')) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadDocuments()
          alert('Dokument gelöscht!')
        } else {
          throw new Error('Fehler beim Löschen')
        }
      } catch (error) {
        console.error('Fehler:', error)
        alert('Fehler beim Löschen des Dokuments.')
      }
    }
  }

  const handleDownload = (doc: Document) => {
    // Erstelle einen temporären Link für den Download
    const link = window.document.createElement('a')
    link.href = doc.path
    link.download = doc.name
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unbekannt'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / 1048576) + ' MB'
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = !selectedProject || selectedProject === 'all' || doc.projectId === selectedProject
    return matchesSearch && matchesProject
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Dokumente</h1>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Dokument hochladen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="uploadProject">Projekt zuordnen (optional)</Label>
            <Select
              value={uploadProject}
              onValueChange={setUploadProject}
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
          
          <div>
            <Label htmlFor="fileUpload">Datei auswählen</Label>
            <Input
              id="fileUpload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">
                Dokument wird hochgeladen...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Projekte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Projekte</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div>Dokumente werden geladen...</div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedProject ? 'Keine Dokumente gefunden.' : 'Noch keine Dokumente vorhanden.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {document.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Größe: {formatFileSize(document.size)}</span>
                      <span>
                        Hochgeladen: {new Date(document.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    {document.project && (
                      <div className="text-sm text-blue-600">
                        Projekt: {document.project.name}
                      </div>
                    )}

                    {document.mimeType && (
                      <div className="text-sm text-muted-foreground">
                        Typ: {document.mimeType}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
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
