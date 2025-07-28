'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Bell,
  Search,
  User,
  Moon,
  Sun,
  Monitor,
  Settings,
  LogOut,
  Command,
  FileText,
  Users,
  Calendar,
  Mail,
  FolderOpen,
  Clock
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/lib/notifications'

interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  url: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  createdAt: string
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { requestPermission, hasPermission, showCalendarReminder, showTimeTrackingReminder } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    loadNotifications()
    
    // Benachrichtigungen alle 5 Minuten aktualisieren
    const notificationInterval = setInterval(loadNotifications, 5 * 60 * 1000)
    
    // Stündliche Reminder für Time Tracking
    const timeTrackingInterval = setInterval(checkTimeTrackingReminders, 60 * 60 * 1000)
    
    // Listen for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    // Request notification permission
    requestPermission()
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(notificationInterval)
      clearInterval(timeTrackingInterval)
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.length)
        
        // Browser-Benachrichtigungen anzeigen (wenn erlaubt)
        if (hasPermission()) {
          data.forEach((notification: Notification) => {
            // Nur neue Benachrichtigungen anzeigen (die in den letzten 5 Minuten erstellt wurden)
            const notificationTime = new Date(notification.createdAt)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            
            if (notificationTime > fiveMinutesAgo) {
              if (notification.type === 'calendar') {
                showCalendarReminder({
                  id: notification.data.id,
                  title: notification.data.title,
                  startTime: notification.data.startTime,
                  description: notification.data.description
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const checkTimeTrackingReminders = async () => {
    try {
      const response = await fetch('/api/notifications?type=timetracking')
      if (response.ok) {
        const timeTrackingNotifications = await response.json()
        
        timeTrackingNotifications.forEach((notification: Notification) => {
          if (notification.type === 'timetracking' && hasPermission()) {
            showTimeTrackingReminder({
              id: notification.data.id,
              activity: notification.data.activity || 'Unbekannte Aktivität',
              projectName: notification.data.project?.name,
              startTime: notification.data.startTime
            })
          }
        })
      }
    } catch (error) {
      console.error('Error checking time tracking reminders:', error)
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const performSearch = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    router.push(result.url)
    setShowCommandPalette(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0])
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen className="h-4 w-4" />
      case 'contact': return <Users className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'calendar': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'timetracking': return <Clock className="h-4 w-4 text-orange-500" />
      case 'email': return <Mail className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  if (!mounted) {
    return null
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setShowCommandPalette(true)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm text-left text-muted-foreground hover:bg-accent transition-colors"
            >
              Projekte, Aufgaben oder Kontakte suchen...
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Benachrichtigungen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem key={notification.id}>
                    <div className="flex items-start gap-3 w-full">
                      {getNotificationIcon(notification.type)}
                      <div className="flex flex-col space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <div className="text-sm text-muted-foreground">
                    Keine Benachrichtigungen
                  </div>
                </DropdownMenuItem>
              )}
              {notifications.length > 5 && (
                <DropdownMenuItem onClick={() => setUnreadCount(0)}>
                  <div className="text-sm text-center w-full">
                    Alle als gelesen markieren
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={cycleTheme}>
            {getThemeIcon()}
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Einstellungen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette */}
      <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Suche</DialogTitle>
            <DialogDescription>
              Suchen Sie nach Projekten, Aufgaben, Kontakten und mehr.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Was suchen Sie?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Suche läuft...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          {result.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {result.type === 'project' && 'Projekt'}
                          {result.type === 'contact' && 'Kontakt'}
                          {result.type === 'note' && 'Notiz'}
                          {result.type === 'document' && 'Dokument'}
                          {result.type === 'event' && 'Termin'}
                          {result.type === 'email' && 'E-Mail'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Keine Ergebnisse gefunden
                  </div>
                )}
              </div>
            )}
            
            {searchQuery.length < 2 && (
              <div className="text-xs text-muted-foreground">
                Geben Sie mindestens 2 Zeichen ein, um zu suchen.
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
