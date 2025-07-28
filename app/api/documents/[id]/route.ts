import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

// DELETE /api/documents/[id] - Dokument löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Dokument aus DB abrufen
    const document = await prisma.document.findUnique({
      where: { id: params.id }
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Datei vom Dateisystem löschen
    try {
      const filePath = path.join(process.cwd(), document.path)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Datei nicht gefunden, trotzdem aus DB löschen
    }
    
    // Dokument aus DB löschen
    await prisma.document.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
