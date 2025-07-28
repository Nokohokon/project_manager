import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/data/export - Alle Daten exportieren
export async function GET(request: NextRequest) {
  try {
    // Alle Daten aus der Datenbank abrufen
    const [
      projects,
      contacts,
      documents,
      notes,
      calendarEvents,
      emailMessages,
      timeEntries,
      settings
    ] = await Promise.all([
      prisma.project.findMany({ include: { _count: true } }),
      prisma.contact.findMany(),
      prisma.document.findMany(),
      prisma.note.findMany(),
      prisma.calendarEvent.findMany(),
      prisma.emailMessage.findMany(),
      prisma.timeEntry.findMany(),
      prisma.setting.findMany()
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        projects,
        contacts,
        documents: documents.map((doc: any) => ({
          ...doc,
          filePath: undefined // Dateipfade aus Sicherheitsgründen nicht exportieren
        })),
        notes,
        calendarEvents,
        emailMessages,
        timeEntries,
        settings
      },
      statistics: {
        projectsCount: projects.length,
        contactsCount: contacts.length,
        documentsCount: documents.length,
        notesCount: notes.length,
        calendarEventsCount: calendarEvents.length,
        emailMessagesCount: emailMessages.length,
        timeEntriesCount: timeEntries.length
      }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="crm-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

// DELETE /api/data/export - Alle Daten löschen
export async function DELETE(request: NextRequest) {
  try {
    // In der richtigen Reihenfolge löschen (wegen Foreign Key Constraints)
    await prisma.timeEntry.deleteMany()
    await prisma.emailMessage.deleteMany()
    await prisma.calendarEvent.deleteMany()
    await prisma.note.deleteMany()
    await prisma.document.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.project.deleteMany()
    // Settings behalten wir
    
    return NextResponse.json({ 
      message: 'Alle Benutzerdaten wurden erfolgreich gelöscht',
      deletedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting all data:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}
