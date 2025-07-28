'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  Play, 
  Pause, 
  Square,
  Timer as TimerIcon,
  Calendar,
  BarChart3
} from 'lucide-react'

interface Project {
  id: string
  name: string
}

export default function TimeTrackingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [activity, setActivity] = useState('')
  const [description, setDescription] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [entries, setEntries] = useState<any[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  // Zeiteinträge für das ausgewählte Projekt laden (alle Einträge)
  const fetchEntries = async (projectId: string) => {
    if (!projectId) {
      setEntries([])
      return
    }
    setLoadingEntries(true)
    try {
      const res = await fetch(`/api/timetracking?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      } else {
        setEntries([])
      }
    } catch {
      setEntries([])
    }
    setLoadingEntries(false)
  }

  const activities = [
    'Entwicklung',
    'Design',
    'Planung',
    'Meeting',
    'Testing',
    'Dokumentation',
    'Brainstorming',
    'Research',
    'Review'
  ]

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data.filter((p: any) => p.status === 'active'))
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  // Einträge laden, wenn Projekt gewechselt wird
  useEffect(() => {
    if (selectedProject) {
      fetchEntries(selectedProject)
    } else {
      setEntries([])
    }
  }, [selectedProject])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1)
      }, 1000)
    } else if (!isRunning && seconds !== 0) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, seconds])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (selectedProject && activity) {
      setIsRunning(true)
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (seconds > 0 && selectedProject && activity) {
      const now = new Date();
      const startTime = new Date(now.getTime() - seconds * 1000);
      try {
        const res = await fetch('/api/timetracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProject,
            activity,
            description,
            startTime: startTime.toISOString(),
            endTime: now.toISOString(),
            duration: Math.floor(seconds / 60),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || 'Fehler beim Speichern des Zeiteintrags.');
        } else {
          // Nach erfolgreichem Speichern neu laden
          fetchEntries(selectedProject)
        }
      } catch (error) {
        alert('Fehler beim Speichern des Zeiteintrags.');
      }
      setIsRunning(false);
      setSeconds(0);
      setDescription('');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zeiterfassung</h1>
        <p className="text-muted-foreground mt-2">
          Erfassen Sie Ihre Arbeitszeit nach Projekten und Aktivitäten
        </p>
      </div>

      {/* Timer Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerIcon className="h-5 w-5" />
            Timer
          </CardTitle>
          <CardDescription>
            Starten Sie die Zeiterfassung für Ihre aktuelle Tätigkeit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zeit Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary">
              {formatTime(seconds)}
            </div>
            <p className="text-muted-foreground mt-2">
              {isRunning ? 'Timer läuft...' : 'Timer gestoppt'}
            </p>
          </div>

          {/* Projekt Auswahl */}
          <div className="space-y-2">
            <Label htmlFor="project">Projekt *</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Projekt auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aktivität Auswahl */}
          <div className="space-y-2">
            <Label htmlFor="activity">Aktivität *</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Aktivität auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {activities.map((act) => (
                  <SelectItem key={act} value={act}>
                    {act}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was machen Sie gerade?"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button 
                onClick={handleStart} 
                disabled={!selectedProject || !activity}
                size="lg"
                className="px-8"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" size="lg" className="px-8">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={handleStop} 
              variant="destructive" 
              disabled={seconds === 0}
              size="lg"
              className="px-8"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop & Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Einträge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Zeiteinträge
          </CardTitle>
          <CardDescription>
            Alle erfassten Zeiten für das gewählte Projekt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEntries ? (
            <div className="text-center py-8 text-muted-foreground">Lade Einträge...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Zeiteinträge</p>
              <p className="text-sm">Starten Sie den Timer, um Zeit zu erfassen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-3 bg-muted/50">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{entry.activity}</span>
                    {entry.description && <span className="text-sm text-muted-foreground">{entry.description}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <Badge variant="outline">{formatTime((entry.duration ?? 0) * 60)}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(entry.startTime).toLocaleDateString()} {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
