// Notification Service für Browser und Electron
class NotificationService {
  private static instance: NotificationService
  private isElectron: boolean
  private electronAPI: any

  constructor() {
    this.isElectron = typeof window !== 'undefined' && (window as any).electronAPI
    this.electronAPI = this.isElectron ? (window as any).electronAPI : null
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<boolean> {
    if (this.isElectron) {
      // Electron hat standardmäßig Notification-Rechte
      return true
    }

    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  hasPermission(): boolean {
    if (this.isElectron) {
      return true
    }

    return 'Notification' in window && Notification.permission === 'granted'
  }

  show(title: string, options: {
    body?: string
    icon?: string
    tag?: string
    data?: any
    onclick?: () => void
  } = {}): void {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted')
      return
    }

    if (this.isElectron && this.electronAPI) {
      // Electron Notification
      this.electronAPI.showNotification({
        title,
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        data: options.data
      })
    } else if ('Notification' in window) {
      // Browser Notification
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        data: options.data
      })

      if (options.onclick) {
        notification.onclick = options.onclick
      }

      // Auto-close nach 5 Sekunden
      setTimeout(() => {
        notification.close()
      }, 5000)
    }
  }

  showCalendarReminder(event: {
    id: string
    title: string
    startTime: string
    description?: string
  }): void {
    const startTime = new Date(event.startTime)
    const timeString = startTime.toLocaleString('de-DE')

    this.show(`Anstehender Termin: ${event.title}`, {
      body: `${timeString}\n${event.description || ''}`,
      icon: '/favicon.ico',
      tag: `calendar-${event.id}`,
      data: { type: 'calendar', eventId: event.id },
      onclick: () => {
        // Navigiere zum Kalender
        if (typeof window !== 'undefined') {
          window.focus()
          window.location.href = '/calendar'
        }
      }
    })
  }

  showTimeTrackingReminder(entry: {
    id: string
    activity: string
    projectName?: string
    startTime: string
  }): void {
    const duration = this.getRunningDuration(entry.startTime)

    this.show('Zeit-Tracking läuft', {
      body: `${entry.activity} (${entry.projectName || 'Unbekanntes Projekt'})\nLäuft seit: ${duration}`,
      icon: '/favicon.ico',
      tag: `timetracking-${entry.id}`,
      data: { type: 'timetracking', entryId: entry.id },
      onclick: () => {
        if (typeof window !== 'undefined') {
          window.focus()
          window.location.href = '/timetracking'
        }
      }
    })
  }

  private getRunningDuration(startTime: string): string {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }
}

// Notification Hook für React
export function useNotifications() {
  const notificationService = NotificationService.getInstance()

  const requestPermission = async () => {
    return await notificationService.requestPermission()
  }

  const hasPermission = () => {
    return notificationService.hasPermission()
  }

  const showNotification = (title: string, options?: any) => {
    notificationService.show(title, options)
  }

  const showCalendarReminder = (event: any) => {
    notificationService.showCalendarReminder(event)
  }

  const showTimeTrackingReminder = (entry: any) => {
    notificationService.showTimeTrackingReminder(entry)
  }

  return {
    requestPermission,
    hasPermission,
    showNotification,
    showCalendarReminder,
    showTimeTrackingReminder
  }
}

export default NotificationService
