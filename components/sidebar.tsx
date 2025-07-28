'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home,
  FolderOpen,
  Clock,
  Users,
  FileText,
  FolderX,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projekte', href: '/projects', icon: FolderOpen },
  { name: 'Zeiterfassung', href: '/timetracking', icon: Clock },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'E-Mail', href: '/emails', icon: Mail },
  { name: 'Notizen', href: '/notes', icon: FileText },
  { name: 'Dokumente', href: '/documents', icon: FolderX },
  { name: 'Kalender', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      'flex flex-col bg-card border-r transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h1 className="text-lg font-semibold">Project Manager</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      collapsed && 'px-2',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            Project Management App v1.0
          </p>
        )}
      </div>
    </div>
  )
}
