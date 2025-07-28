import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Imap from 'imap'

interface ImapConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}

// GET /api/emails/folders - Alle verfügbaren E-Mail Ordner abrufen
export async function GET(request: NextRequest) {
  try {
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

    const folders = await getImapFolders(imapConfig)
    
    // Deutsche Namen für All-Inkl Ordner
    const folderMapping: Record<string, string> = {
      'INBOX': 'Posteingang',
      'INBOX.Drafts': 'Entwürfe',
      'INBOX.Sent': 'Gesendet', 
      'INBOX.Junk': 'Spam',
      'INBOX.Trash': 'Papierkorb',
      'INBOX.Archive': 'Archiv',
      'Drafts': 'Entwürfe',
      'Sent': 'Gesendet',
      'Junk': 'Spam', 
      'Trash': 'Papierkorb',
      'Archive': 'Archiv'
    }
    
    // Hole Nachrichtenanzahl für jeden Ordner
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        try {
          let count = await getFolderMessageCount(imapConfig, folder)
          
          // Für "Gesendet"-Ordner: Addiere auch E-Mails aus der Datenbank
          if (folder === 'Sent' || folder === 'INBOX.Sent') {
            try {
              const sentCount = await prisma.emailMessage.count({
                where: { folder: 'SENT' }
              })
              count += sentCount
            } catch (dbError) {
              console.error('Fehler beim Zählen der DB-E-Mails:', dbError)
            }
          }
          
          return {
            value: folder,
            label: folderMapping[folder] || folder,
            count: count
          }
        } catch (error) {
          console.error(`Fehler beim Zählen der Nachrichten in ${folder}:`, error)
          return {
            value: folder,
            label: folderMapping[folder] || folder,
            count: 0
          }
        }
      })
    )
    
    return NextResponse.json({ 
      success: true,
      folders: foldersWithCounts 
    })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Ordner: ' + (error as Error).message },
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
            const fullName = prefix ? `${prefix}${boxes[name].delimiter || '.'}${name}` : name
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

function getFolderMessageCount(config: ImapConfig, folderName: string): Promise<number> {
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
      imap.openBox(folderName, true, (err, box) => {
        imap.end()
        if (err) {
          resolve(0) // Bei Fehler 0 zurückgeben anstatt reject
          return
        }
        resolve(box.messages.total)
      })
    })

    imap.once('error', (err: any) => {
      resolve(0) // Bei Fehler 0 zurückgeben anstatt reject
    })

    imap.connect()
  })
}
