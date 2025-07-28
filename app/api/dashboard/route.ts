import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stats = await prisma.$transaction(async (tx: any) => {
      // Heute's Zeiteinträge
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayTimeEntries = await tx.timeEntry.findMany({
        where: {
          startTime: {
            gte: today,
            lt: tomorrow,
          },
        },
      })

      // Berechne heute erfasste Zeit
      const todayMinutes = todayTimeEntries.reduce((total: number, entry: any) => {
        if (entry.duration) {
          return total + entry.duration
        }
        return total
      }, 0)

      // Anzahl aktiver Projekte
      const activeProjects = await tx.project.count({
        where: { status: 'active' }
      })

      // Anzahl offener Aufgaben
      const openTasks = await tx.task.count({
        where: { completed: false }
      })

      // Anzahl Notizen
      const notesCount = await tx.note.count()

      return {
        timeTracked: todayMinutes,
        activeProjects,
        openTasks,
        notesCount,
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
