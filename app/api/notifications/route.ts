import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Benachrichtigungen abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'calendar', 'timetracking', 'all'
    
    const notifications = []
    
    // Kalender-Benachrichtigungen (Events in den nächsten 24h)
    if (type === 'calendar' || type === 'all' || !type) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const upcomingEvents = await prisma.calendarEvent.findMany({
        where: {
          startTime: {
            gte: new Date(),
            lte: tomorrow
          }
        },
        include: {
          project: {
            select: { name: true }
          }
        }
      })
      
      notifications.push(...upcomingEvents.map((event: any) => ({
        id: `calendar-${event.id}`,
        type: 'calendar',
        title: 'Anstehender Termin',
        message: `${event.title} am ${new Date(event.startTime).toLocaleString('de-DE')}`,
        data: event,
        createdAt: new Date().toISOString()
      })))
    }
    
    // Time Tracking-Benachrichtigungen (laufende Timer > 1h)
    if (type === 'timetracking' || type === 'all' || !type) {
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)
      
      const longRunningEntries = await prisma.timeEntry.findMany({
        where: {
          endTime: null, // Laufende Einträge
          startTime: {
            lte: oneHourAgo
          }
        },
        include: {
          project: {
            select: { name: true }
          }
        }
      })
      
      notifications.push(...longRunningEntries.map((entry: any) => ({
        id: `timetracking-${entry.id}`,
        type: 'timetracking',
        title: 'Zeiterfassung läuft',
        message: `Timer für "${entry.project?.name || 'Unbekanntes Projekt'}" läuft seit über 1 Stunde`,
        data: entry,
        createdAt: new Date().toISOString()
      })))
    }
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Browser-Benachrichtigung senden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, data } = body
    
    // Hier könnte man später Benachrichtigungen in der DB speichern
    // oder Push-Notifications versenden
    
    return NextResponse.json({ 
      success: true,
      notification: {
        title,
        message,
        type,
        data,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
