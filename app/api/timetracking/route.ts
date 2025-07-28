import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Alle Zeiteinträge abrufen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const where = projectId ? { projectId } : undefined;
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { startTime: 'desc' },
      include: { project: true },
    });
    return NextResponse.json(timeEntries);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Zeiteinträge.' }, { status: 500 });
  }
}

// POST: Neuen Zeiteintrag speichern
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { projectId, activity, description, startTime, endTime, duration } = data;
    if (!projectId || !activity || !startTime) {
      return NextResponse.json({ error: 'Projekt, Aktivität und Startzeit sind erforderlich.' }, { status: 400 });
    }
    const entry = await prisma.timeEntry.create({
      data: {
        projectId,
        activity,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Speichern des Zeiteintrags.' }, { status: 500 });
  }
}
