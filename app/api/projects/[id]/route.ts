import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Einzelnes Projekt mit allen zugehörigen Daten abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        timeEntries: {
          orderBy: {
            startTime: 'desc'
          }
        },
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        },
        notes: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            size: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            priority: true,
            dueDate: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        calendarEvents: {
          select: {
            id: true,
            title: true,
            startTime: true,
            type: true
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Fehler beim Laden des Projekts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Projekts' },
      { status: 500 }
    )
  }
}

// PUT: Projekt aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, status, priority, startDate, endDate } = await request.json()

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Projekts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Projekts' },
      { status: 500 }
    )
  }
}

// DELETE: Projekt löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Projekts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Projekts' },
      { status: 500 }
    )
  }
}
