import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics - Analytics Daten abrufen
export async function GET() {
  try {
    // Projekt-Statistiken
    const projectStats = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Zeiterfassung nach Projekten
    const timeByProject = await prisma.timeEntry.groupBy({
      by: ['projectId'],
      _sum: {
        duration: true
      },
      _count: {
        projectId: true
      }
    })

    // Projekte für die Namen
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true
      }
    })

    // Zeit nach Aktivitäten
    const timeByActivity = await prisma.timeEntry.groupBy({
      by: ['activity'],
      _sum: {
        duration: true
      }
    })

    // Aufgaben-Statistiken
    const taskStats = await prisma.task.groupBy({
      by: ['completed'],
      _count: {
        completed: true
      }
    })

    // Aufgaben nach Priorität
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    })

    // Überfällige Aufgaben
    const overdueTasks = await prisma.task.count({
      where: {
        completed: false,
        dueDate: {
          lt: new Date()
        }
      }
    })

    // Monatsstatistiken
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const monthlyTimeEntries = await prisma.timeEntry.findMany({
      where: {
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        duration: true,
        startTime: true
      }
    })

    // Tägliche Arbeitszeit diesen Monat
    const dailyWork = monthlyTimeEntries.reduce((acc: any, entry: any) => {
      const day = entry.startTime.getDate()
      acc[day] = (acc[day] || 0) + (entry.duration || 0)
      return acc
    }, {})

    return NextResponse.json({
      projectStats: projectStats.map((stat: any) => ({
        status: stat.status,
        count: stat._count.status
      })),
      timeByProject: timeByProject.map((time: any) => {
        const project = projects.find((p: any) => p.id === time.projectId)
        return {
          projectName: project?.name || 'Unbekannt',
          totalTime: time._sum.duration || 0,
          entryCount: time._count.projectId
        }
      }),
      timeByActivity: timeByActivity.map((activity: any) => ({
        activity: activity.activity,
        totalTime: activity._sum.duration || 0
      })),
      taskStats: {
        completed: taskStats.find((t: any) => t.completed)?._count.completed || 0,
        pending: taskStats.find((t: any) => !t.completed)?._count.completed || 0,
        overdue: overdueTasks
      },
      tasksByPriority: tasksByPriority.map((priority: any) => ({
        priority: priority.priority,
        count: priority._count.priority
      })),
      dailyWork: Object.entries(dailyWork).map(([day, minutes]) => ({
        day: parseInt(day),
        minutes: minutes as number,
        hours: Math.round((minutes as number) / 60 * 100) / 100
      }))
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
