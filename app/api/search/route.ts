import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search - Globale Suche
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = `%${query.toLowerCase()}%`
    
    // Parallele Suche in verschiedenen Bereichen
    const [projects, contacts, notes, documents, calendarEvents, emails] = await Promise.all([
      // Projekte
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true
        }
      }),
      
      // Kontakte
      prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { company: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true
        }
      }),
      
      // Notizen
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          title: true,
          content: true,
          project: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Dokumente
      prisma.document.findMany({
        where: {
          OR: [
            { fileName: { contains: query } },
            { originalName: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          fileName: true,
          originalName: true,
          project: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Kalender-Events
      prisma.calendarEvent.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          project: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // E-Mails
      prisma.emailMessage.findMany({
        where: {
          OR: [
            { subject: { contains: query } },
            { from: { contains: query } },
            { to: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          subject: true,
          from: true,
          to: true,
          project: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Ergebnisse formatieren
    const results = [
      ...projects.map((item: any) => ({
        id: item.id,
        type: 'project',
        title: item.name,
        description: item.description,
        url: `/projects/${item.id}`
      })),
      ...contacts.map((item: any) => ({
        id: item.id,
        type: 'contact',
        title: `${item.firstName} ${item.lastName}`,
        description: `${item.email} ${item.company ? `- ${item.company}` : ''}`,
        url: `/crm`
      })),
      ...notes.map((item: any) => ({
        id: item.id,
        type: 'note',
        title: item.title,
        description: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        url: `/notes`
      })),
      ...documents.map((item: any) => ({
        id: item.id,
        type: 'document',
        title: item.originalName || item.fileName,
        description: item.project?.name ? `Projekt: ${item.project.name}` : '',
        url: `/documents`
      })),
      ...calendarEvents.map((item: any) => ({
        id: item.id,
        type: 'event',
        title: item.title,
        description: `${new Date(item.startTime).toLocaleDateString('de-DE')} ${item.description || ''}`,
        url: `/calendar`
      })),
      ...emails.map((item: any) => ({
        id: item.id,
        type: 'email',
        title: item.subject,
        description: `Von: ${item.from}`,
        url: `/emails`
      }))
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
