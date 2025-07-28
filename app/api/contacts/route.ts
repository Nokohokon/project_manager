import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contacts - Alle Kontakte abrufen
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Neuen Kontakt erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const contact = await prisma.contact.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        notes: body.notes,
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
    
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
