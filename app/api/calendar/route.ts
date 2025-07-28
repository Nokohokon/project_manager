import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/calendar - Alle Kalendereinträge abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    let whereClause = {}
    
    // Filter nach Monat/Jahr wenn angegeben
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      whereClause = {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    }
    
    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

// POST /api/calendar - Neuen Kalendereintrag erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Calendar API received:', body)
    
    // Validation
    if (!body.title || !body.startTime) {
      return NextResponse.json(
        { error: 'Title and start time are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDate = new Date(body.startTime)
    const endDate = body.endTime ? new Date(body.endTime) : null
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date' },
        { status: 400 }
      )
    }
    
    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid end date' },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description || null,
        startTime: startDate,
        endTime: endDate,
        allDay: body.allDay || false,
        type: body.type || 'event',
        projectId: body.projectId || null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
