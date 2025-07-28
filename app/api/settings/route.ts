import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/settings - Alle Settings abrufen
export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    
    // Settings als Key-Value Objekt zurückgeben
    const settingsObject = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST /api/settings - Settings speichern oder aktualisieren
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Für jedes Setting ein upsert durchführen
    const promises = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )
    
    await Promise.all(promises)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

// DELETE /api/settings - Alle Settings löschen
export async function DELETE() {
  try {
    await prisma.setting.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting settings:', error)
    return NextResponse.json(
      { error: 'Failed to delete settings' },
      { status: 500 }
    )
  }
}
