'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Users,
  FileText,
  Mail
} from 'lucide-react'

interface AnalyticsData {
  projectStats: Array<{ status: string; count: number }>
  timeByProject: Array<{ projectName: string; totalTime: number; entryCount: number }>
  timeByActivity: Array<{ activity: string; totalTime: number }>
  taskStats: { completed: number; pending: number; overdue: number }
  tasksByPriority: Array<{ priority: string; count: number }>
  dailyWork: Array<{ day: number; minutes: number; hours: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div>Daten werden geladen...</div>
    </div>
  }

  if (!data) {
    return <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div>Fehler beim Laden der Daten.</div>
    </div>
  }

  // Berechne Gesamtwerte
  const totalWorkHours = data.timeByProject.reduce((sum, project) => sum + (project.totalTime / 60), 0)
  const totalTasks = data.taskStats.completed + data.taskStats.pending
  const efficiency = totalTasks > 0 ? Math.round((data.taskStats.completed / totalTasks) * 100) : 0
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analysieren Sie Ihre Produktivität und Projektfortschritte
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Arbeitszeit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalWorkHours * 10) / 10}h</div>
            <p className="text-xs text-muted-foreground">
              Insgesamt erfasst
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effizienz</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Erledigte Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erledigte Aufgaben</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taskStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {data.taskStats.overdue} überfällig
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.projectStats.find(s => s.status === 'active')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              von {data.projectStats.reduce((sum, s) => sum + s.count, 0)} gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zeitverteilung nach Projekten</CardTitle>
            <CardDescription>
              Ihre Arbeitszeit aufgeteilt nach Projekten (in Stunden)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.timeByProject.map(p => ({
                  name: p.projectName,
                  hours: Math.round(p.totalTime / 60 * 10) / 10
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aufgaben nach Priorität</CardTitle>
            <CardDescription>
              Verteilung Ihrer Aufgaben nach Prioritätsstufen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({priority, count}) => `${priority}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tägliche Arbeitszeit (aktueller Monat)</CardTitle>
            <CardDescription>
              Ihre tägliche Arbeitszeit in Stunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyWork}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projektstatus Übersicht</CardTitle>
            <CardDescription>
              Status aller Ihrer Projekte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projectStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
