import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, projectId, tags } = body

    const note = await prisma.note.create({
      data: {
        title,
        content,
        projectId: projectId || null,
        tags: tags || null,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
