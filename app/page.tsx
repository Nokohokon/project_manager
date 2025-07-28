'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  Plus, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  FolderOpen,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react'

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

interface DashboardStats {
  timeTracked: number
  activeProjects: number
  openTasks: number
  notesCount: number
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const quickActions = [
    { icon: Plus, label: 'Neues Projekt', href: '/projects/create' },
    { icon: Timer, label: 'Zeit erfassen', href: '/timetracking' },
    { icon: FileText, label: 'Notiz erstellen', href: '/notes/create' },
    { icon: Calendar, label: 'Termin planen', href: '/calendar' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, statsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/dashboard')
        ])

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.filter((p: Project) => p.status === 'active').slice(0, 3))
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Willkommen zurück!</h1>
        <p className="text-muted-foreground mt-2">
          Hier ist eine Übersicht über Ihre heutigen Aktivitäten und Projekte
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Schnelle Aktionen für Ihre tägliche Arbeit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-accent"
                asChild
              >
                <a href={action.href}>
                  <action.icon className="h-6 w-6" />
                  <span className="text-sm">{action.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute erfasst</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatTime(stats.timeTracked) : '0h 0m'}
            </div>
            <p className="text-xs text-muted-foreground">
              Erfasste Zeit heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Laufende Projekte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Noch zu erledigen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notizen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.notesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Gespeicherte Notizen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Aktive Projekte
          </CardTitle>
          <CardDescription>
            Ihre laufenden Projekte und deren Fortschritt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Projekte vorhanden</p>
              <Button asChild className="mt-4">
                <a href="/projects/create">Erstes Projekt erstellen</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Fortschritt</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    {project.deadline && (
                      <p className="text-sm text-muted-foreground">
                        Deadline: {new Date(project.deadline).toLocaleDateString('de-DE')}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{project._count.timeEntries} Zeiteinträge</span>
                      <span>{project._count.tasks} Aufgaben</span>
                      <span>{project._count.notes} Notizen</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
