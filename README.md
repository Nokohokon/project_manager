# Project Management Desktop App

Eine moderne, projektbasierte Desktop-Anwendung für umfassendes Projektmanagement, Zeiterfassung, CRM und mehr.

## 🚀 Features

- **📊 Dashboard** - Übersicht über alle Aktivitäten und Projekte
- **📁 Projektverwaltung** - Erstellen und verwalten Sie Ihre Projekte
- **⏱️ Zeiterfassung** - Erfassen Sie Zeit nach Projekten und Aktivitäten
- **👥 CRM** - Verwalten Sie Kundenkontakte und Beziehungen
- **📝 Notizen** - Organisieren Sie Ihre Gedanken und Ideen
- **📄 Dokumentenablage** - Zentrale Verwaltung aller Projektdokumente
- **📅 Kalender** - Planen Sie Termine und Deadlines
- **📈 Analytics** - Detaillierte Berichte und Diagramme
- **⚙️ Einstellungen** - Dark/Light Mode, Benachrichtigungen, Datenexport

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Desktop**: Electron
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Datenbank**: SQLite + Prisma ORM
- **State Management**: Zustand
- **Charts**: Recharts
- **Kalender**: React Big Calendar
- **Icons**: Lucide React
- **Themes**: next-themes

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Entwicklung starten

1. **Dependencies installieren**
```bash
npm install
```

2. **Datenbank initialisieren**
```bash
npx prisma generate
npx prisma db push
```

3. **Datenbank mit Beispieldaten befüllen (optional)**
```bash
npx prisma db seed
```

4. **Entwicklungsserver starten**
```bash
npm run dev
```

5. **Electron App starten**
```bash
npm run electron
# or
pnpm dev
# or
bun dev
```

## 📧 E-Mail Konfiguration

Die App unterstützt E-Mail-Funktionalitäten sowohl für das Senden (SMTP) als auch für das Empfangen (IMAP) von E-Mails.

### SMTP-Einstellungen (E-Mail senden)
Konfigurieren Sie in den Einstellungen:
- **SMTP Host**: z.B. `smtp.all-inkl.com`
- **SMTP Port**: Meist `587` (STARTTLS) oder `465` (SSL)
- **Benutzername**: Ihre E-Mail-Adresse
- **Passwort**: Ihr E-Mail-Passwort
- **Absender**: E-Mail-Adresse für ausgehende Mails

### IMAP-Einstellungen (E-Mail empfangen)
Konfigurieren Sie in den Einstellungen:
- **IMAP Host**: z.B. `imap.all-inkl.com`
- **IMAP Port**: Meist `993` (SSL) oder `143` (STARTTLS)
- **Benutzername**: Ihre E-Mail-Adresse
- **Passwort**: Ihr E-Mail-Passwort
- **SSL/TLS**: Aktiviert (empfohlen)

### Häufige Provider-Einstellungen
- **All-Inkl**: 
  - SMTP: `smtp.all-inkl.com:587`
  - IMAP: `imap.all-inkl.com:993`
- **Gmail**: 
  - SMTP: `smtp.gmail.com:587`
  - IMAP: `imap.gmail.com:993`
- **Outlook**: 
  - SMTP: `smtp-mail.outlook.com:587`
  - IMAP: `outlook.office365.com:993`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
