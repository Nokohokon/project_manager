import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Imap from 'imap'
import { simpleParser } from 'mailparser'

interface ImapConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}

// GET /api/emails/receive - E-Mails vom IMAP-Server abrufen
export async function GET(request: NextRequest) {
  try {
    // Folder parameter aus URL holen
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'INBOX'
    
    console.log(`Versuche E-Mails aus Ordner zu laden: ${folder}`)
    
    // IMAP-Settings aus der Datenbank abrufen
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['imap_host', 'imap_port', 'imap_user', 'imap_pass', 'imap_secure']
        }
      }
    })

    const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    if (!settingsMap.imap_host || !settingsMap.imap_user || !settingsMap.imap_pass) {
      return NextResponse.json(
        { success: false, error: 'IMAP-Einstellungen nicht vollständig konfiguriert' },
        { status: 400 }
      )
    }

    // IMAP-Konfiguration
    const imapConfig: ImapConfig = {
      host: settingsMap.imap_host,
      port: parseInt(settingsMap.imap_port) || 993,
      secure: settingsMap.imap_secure === 'true',
      user: settingsMap.imap_user,
      password: settingsMap.imap_pass
    }

    const emails = await fetchEmailsFromImap(imapConfig, folder)
    
    return NextResponse.json({ 
      success: true,
      emails: emails 
    })
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der E-Mails: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { folder = 'INBOX' } = await request.json()
    
    // IMAP-Settings aus der Datenbank abrufen
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['imap_host', 'imap_port', 'imap_user', 'imap_pass', 'imap_secure']
        }
      }
    })

    const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    if (!settingsMap.imap_host || !settingsMap.imap_user || !settingsMap.imap_pass) {
      return NextResponse.json(
        { error: 'IMAP-Einstellungen nicht vollständig konfiguriert' },
        { status: 400 }
      )
    }

    // IMAP-Konfiguration
    const imapConfig: ImapConfig = {
      host: settingsMap.imap_host,
      port: parseInt(settingsMap.imap_port) || 993,
      secure: settingsMap.imap_secure === 'true',
      user: settingsMap.imap_user,
      password: settingsMap.imap_pass
    }

    const emails = await fetchEmailsFromImap(imapConfig, folder)
    
    // Speichere neue E-Mails in der Datenbank
    for (const email of emails) {
      try {
        // Prüfe ob E-Mail bereits existiert (anhand Message-ID)
        const existingEmail = await prisma.emailMessage.findFirst({
          where: {
            messageId: email.messageId || `${email.subject}-${email.date}`
          }
        })

        if (!existingEmail) {
          await prisma.emailMessage.create({
            data: {
              messageId: email.messageId || `${email.subject}-${email.date}`,
              to: email.to,
              from: email.from,
              subject: email.subject,
              body: email.body,
              isRead: false,
              sentAt: email.date,
              contactId: null, // Könnte später automatisch zugeordnet werden
              projectId: null
            }
          })
        }
      } catch (dbError) {
        console.error('Fehler beim Speichern der E-Mail:', dbError)
      }
    }

    return NextResponse.json({ 
      message: `${emails.length} E-Mails erfolgreich abgerufen`,
      count: emails.length 
    })
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der E-Mails: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

function getImapFolders(config: ImapConfig): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.secure,
      tlsOptions: {
        rejectUnauthorized: false
      }
    })

    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        imap.end()
        if (err) {
          reject(err)
          return
        }
        
        const folderNames: string[] = []
        
        function extractFolders(boxes: any, prefix = '') {
          for (const name in boxes) {
            const fullName = prefix ? `${prefix}${boxes[name].delimiter || '/'}${name}` : name
            folderNames.push(fullName)
            
            if (boxes[name].children) {
              extractFolders(boxes[name].children, fullName)
            }
          }
        }
        
        extractFolders(boxes)
        console.log('Available folders:', folderNames)
        resolve(folderNames)
      })
    })

    imap.once('error', (err: any) => {
      reject(err)
    })

    imap.connect()
  })
}

function fetchEmailsFromImap(config: ImapConfig, folder: string = 'INBOX'): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.secure,
      tlsOptions: {
        rejectUnauthorized: false
      }
    })

    const emails: any[] = []

    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          reject(err)
          return
        }

        console.log(`IMAP ${folder} info:`, {
          total: box.messages.total,
          new: box.messages.new,
          unseen: box.messages.unseen
        })

        // Prüfe ob überhaupt E-Mails vorhanden sind
        if (box.messages.total === 0) {
          console.log('Keine E-Mails im Postfach gefunden')
          imap.end()
          resolve([])
          return
        }

        // Hole die letzten 10 E-Mails (oder alle wenn weniger vorhanden)
        const startSeq = Math.max(1, box.messages.total - 9)
        const endSeq = box.messages.total
        
        console.log(`Fetching emails from ${startSeq} to ${endSeq}`)
        
        const fetch = imap.seq.fetch(`${startSeq}:${endSeq}`, {
          bodies: '',
          struct: true
        })

        let processedEmails = 0
        const totalToProcess = endSeq - startSeq + 1

        fetch.on('message', (msg, seqno) => {
          let buffer = Buffer.alloc(0)

          msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
              buffer = Buffer.concat([buffer, chunk])
            })

            stream.once('end', () => {
              simpleParser(buffer, (err: any, parsed: any) => {
                if (err) {
                  console.error('Error parsing email:', err)
                } else {
                  emails.push({
                    id: `${folder}_${seqno}`,
                    messageId: parsed.messageId || `${folder}_${seqno}`,
                    to: parsed.to?.text || '',
                    from: parsed.from?.text || '',
                    subject: parsed.subject || 'Kein Betreff',
                    body: parsed.text || parsed.html || '',
                    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
                    folder: folder,
                    read: false
                  })
                }
                
                processedEmails++
                if (processedEmails === totalToProcess) {
                  imap.end()
                  console.log(`Parsed ${emails.length} emails from ${folder}`)
                  resolve(emails)
                }
              })
            })
          })
        })

        fetch.once('error', (err) => {
          reject(err)
        })

        fetch.once('end', () => {
          // Wenn keine Nachrichten verarbeitet wurden, resolve sofort
          if (totalToProcess === 0) {
            imap.end()
            resolve(emails)
          }
        })
      })
    })

    imap.once('error', (err: any) => {
      reject(err)
    })

    imap.connect()
  })
}
