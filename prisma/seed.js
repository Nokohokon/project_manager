const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')




  // Erstelle Standard-Einstellungen

  // Standard-Projekt
  const project = await prisma.project.upsert({
    where: { name: 'Demo Projekt' },
    update: {},
    create: {
      name: 'Demo Projekt',
      description: 'Dies ist ein Beispielprojekt für die Initialisierung.',
      status: 'active',
      progress: 10,
      startDate: new Date(),
    },
  })

  // Standard-Kontakt
  await prisma.contact.upsert({
    where: { email: 'demo@kontakt.de' },
    update: {},
    create: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'demo@kontakt.de',
      phone: '+49123456789',
      company: 'Demo GmbH',
      position: 'Projektmanager',
      projectId: project.id,
    },
  })

  // Standard-Notiz
  await prisma.note.create({
    data: {
      title: 'Willkommen',
      content: 'Dies ist eine Beispielnotiz für das Demo-Projekt.',
      projectId: project.id,
    },
  })

  // Standard-Aufgabe
  await prisma.task.create({
    data: {
      title: 'Erste Aufgabe',
      description: 'Dies ist eine Beispielaufgabe.',
      priority: 'high',
      completed: false,
      projectId: project.id,
    },
  })

  // Standard-Dokument
  await prisma.document.create({
    data: {
      fileName: 'demo.pdf',
      originalName: 'Demo Dokument.pdf',
      filePath: '/files/demo.pdf',
      size: 123456,
      mimeType: 'application/pdf',
      projectId: project.id,
    },
  })

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
