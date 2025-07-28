import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/calendar/[id] - Einzelnen Kalendereintrag abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.calendarEvent.findUnique({
      where: {
        id: params.id
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

    if (!event) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
      { status: 500 }
    )
  }
}

// PUT /api/calendar/[id] - Kalendereintrag aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('Calendar API update received:', body)

    // Validation
    if (!body.title || !body.startTime) {
      return NextResponse.json(
        { error: 'Title and start time are required' },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description || null,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
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

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar/[id] - Kalendereintrag löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.calendarEvent.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
