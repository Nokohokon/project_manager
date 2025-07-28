import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/documents - Alle Dokumente abrufen
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
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
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Dokument hochladen
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Erstelle uploads Ordner falls nicht vorhanden
    const uploadDir = path.join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Ordner existiert bereits
    }
    
    // Datei speichern
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}_${file.name}`
    const filePath = path.join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // Dokument in DB speichern
    const document = await prisma.document.create({
      data: {
        name: file.name,
        path: `/uploads/${fileName}`,
        size: file.size,
        mimeType: file.type,
        projectId: projectId || null
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
    
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
