import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// GET: E-Mails abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'INBOX' // 'INBOX', 'SENT', etc.
    
    const emails = await prisma.emailMessage.findMany({
      where: {
        folder: folder
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
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

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Fehler beim Laden der E-Mails:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der E-Mails' },
      { status: 500 }
    )
  }
}

// POST: E-Mail senden
export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, contactId, projectId, cc, bcc } = await request.json()

    // SMTP-Settings aus der Datenbank laden
    const smtpSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']
        }
      }
    })

    const settingsMap = smtpSettings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Prüfen, ob alle SMTP-Settings vorhanden sind
    const requiredSettings = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']
    const missingSettings = requiredSettings.filter(key => !settingsMap[key])
    
    if (missingSettings.length > 0) {
      return NextResponse.json(
        { error: `SMTP-Einstellungen fehlen: ${missingSettings.join(', ')}` },
        { status: 400 }
      )
    }

    // Nodemailer Transporter konfigurieren
    const transporter = nodemailer.createTransport({
      host: settingsMap.smtp_host,
      port: parseInt(settingsMap.smtp_port),
      secure: parseInt(settingsMap.smtp_port) === 465,
      auth: {
        user: settingsMap.smtp_user,
        pass: settingsMap.smtp_pass,
      },
    })

    // E-Mail senden
    const mailOptions = {
      from: settingsMap.smtp_from,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html: body,
    }

    const info = await transporter.sendMail(mailOptions)

    // Zusätzlich: E-Mail über IMAP in den "Gesendet" Ordner kopieren
    try {
      const imapSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['imap_host', 'imap_port', 'imap_user', 'imap_pass', 'imap_secure']
          }
        }
      })

      const imapSettingsMap = imapSettings.reduce((acc: Record<string, string>, setting: any) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      // Wenn IMAP-Settings vorhanden sind, E-Mail auch in IMAP-Gesendet-Ordner speichern
      if (imapSettingsMap.imap_host && imapSettingsMap.imap_user && imapSettingsMap.imap_pass) {
        const imap = require('imap')
        
        const imapConfig = {
          user: imapSettingsMap.imap_user,
          password: imapSettingsMap.imap_pass,
          host: imapSettingsMap.imap_host,
          port: parseInt(imapSettingsMap.imap_port) || 993,
          tls: imapSettingsMap.imap_secure === 'true',
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 3000,
          connTimeout: 10000
        }

        const imapConnection = new imap(imapConfig)

        await new Promise((resolve, reject) => {
          imapConnection.once('ready', () => {
            // Versuche gesendete E-Mail in verschiedene mögliche Ordnernamen zu speichern
            const possibleSentFolders = ['Gesendet', 'Sent', 'INBOX.Sent', 'INBOX.Gesendet']
            
            let folderFound = false
            
            const tryNextFolder = (index: number) => {
              if (index >= possibleSentFolders.length) {
                if (!folderFound) {
                  console.log('Kein Gesendet-Ordner gefunden, E-Mail nur in DB gespeichert')
                }
                imapConnection.end()
                resolve(true)
                return
              }
              
              const folderName = possibleSentFolders[index]
              
              imapConnection.openBox(folderName, false, (err: any, box: any) => {
                if (!err) {
                  folderFound = true
                  
                  // E-Mail-Content für IMAP erstellen
                  const rawEmail = `From: ${settingsMap.smtp_from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nDate: ${new Date().toUTCString()}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${body}`
                  
                  imapConnection.append(rawEmail, { mailbox: folderName }, (appendErr: any) => {
                    if (appendErr) {
                      console.error('Fehler beim Speichern in IMAP Gesendet-Ordner:', appendErr)
                    } else {
                      console.log(`E-Mail erfolgreich in IMAP ${folderName} gespeichert`)
                    }
                    imapConnection.end()
                    resolve(true)
                  })
                } else {
                  // Ordner nicht gefunden, nächsten versuchen
                  tryNextFolder(index + 1)
                }
              })
            }
            
            tryNextFolder(0)
          })

          imapConnection.once('error', (err: any) => {
            console.error('IMAP-Verbindungsfehler beim Speichern in Gesendet:', err)
            resolve(true) // Trotzdem fortfahren, auch wenn IMAP-Speicherung fehlschlägt
          })

          imapConnection.connect()
        })
      }
    } catch (imapError) {
      console.error('Fehler beim IMAP-Speichern (nicht kritisch):', imapError)
      // Fehler nicht weiterwerfen, da die E-Mail bereits gesendet wurde
    }

    // E-Mail in der Datenbank speichern
    const email = await prisma.emailMessage.create({
      data: {
        from: settingsMap.smtp_from,
        to,
        subject,
        body: typeof body === 'string' ? body : (body?.content || ''), // PATCH: body immer als String speichern
        sent: true,
        isRead: true, // Gesendete E-Mails sind als gelesen markiert
        folder: 'SENT',
        contactId: contactId || null,
        projectId: projectId || null,
        messageId: info.messageId,
        sentAt: new Date()
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      email,
      messageId: info.messageId 
    })
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der E-Mail: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
