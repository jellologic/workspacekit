import { Link, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Server,
  MonitorDot,
  Activity,
  CalendarClock,
  ListTodo,
  Box,
  HardDrive,
  Settings,
  Clock,
  Bookmark,
  Timer,
  Gauge,
  LogOut,
} from 'lucide-react'
import { cn } from '~/lib/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavWorkspace {
  name: string
  uid: string
  running: boolean
  creating: boolean
}

interface NavigatorProps {
  workspaces: NavWorkspace[]
  user?: string
  onLogout: () => void
}

// ---------------------------------------------------------------------------
// localStorage-persisted expand state
// ---------------------------------------------------------------------------

function useExpandState(key: string, defaultOpen = true): [boolean, () => void] {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wsk_nav_${key}`)
      if (stored !== null) setOpen(stored === '1')
    } catch {
      // ignore
    }
  }, [key])

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem(`wsk_nav_${key}`, next ? '1' : '0')
      } catch {
        // ignore
      }
      return next
    })
  }

  return [open, toggle]
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  label,
  expanded,
  onToggle,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-nav-muted hover:text-nav-foreground transition-colors"
    >
      {expanded ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Nav link item
// ---------------------------------------------------------------------------

function NavItem({
  to,
  icon: Icon,
  label,
  active,
  indent = false,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  indent?: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors',
        indent && 'pl-8',
        active
          ? 'bg-nav-active text-white'
          : 'text-nav-foreground hover:bg-nav-hover',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Status dot for workspaces
// ---------------------------------------------------------------------------

function StatusDot({ running, creating }: { running: boolean; creating: boolean }) {
  if (creating) {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-warning animate-pulse" />
  }
  if (running) {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
  }
  return <span className="h-2 w-2 shrink-0 rounded-full bg-nav-muted/50" />
}

// ---------------------------------------------------------------------------
// Navigator component
// ---------------------------------------------------------------------------

export function Navigator({ workspaces, user, onLogout }: NavigatorProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const [hostOpen, toggleHost] = useExpandState('host', true)
  const [monitorOpen, toggleMonitor] = useExpandState('monitor', false)
  const [wsOpen, toggleWs] = useExpandState('workspaces', true)
  const [manageOpen, toggleManage] = useExpandState('manage', false)

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-nav border-r border-nav-border overflow-hidden">
      {/* Logo bar */}
      <div className="flex h-12 items-center gap-2.5 border-b border-nav-border px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-white">
          W
        </div>
        <span className="text-sm font-semibold text-white">WorkspaceKit</span>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {/* Host section */}
        <SectionHeader label="Host" expanded={hostOpen} onToggle={toggleHost} />
        {hostOpen && (
          <div className="space-y-0.5">
            <NavItem
              to="/"
              icon={Server}
              label="Summary"
              active={pathname === '/'}
              indent
            />
            {/* Monitor subsection */}
            <button
              onClick={toggleMonitor}
              className={cn(
                'flex w-full items-center gap-2 rounded px-3 py-1.5 pl-8 text-sm text-nav-foreground hover:bg-nav-hover transition-colors',
              )}
            >
              <MonitorDot className="h-3.5 w-3.5 shrink-0" />
              <span>Monitor</span>
              {monitorOpen ? (
                <ChevronDown className="ml-auto h-3 w-3" />
              ) : (
                <ChevronRight className="ml-auto h-3 w-3" />
              )}
            </button>
            {monitorOpen && (
              <div className="space-y-0.5">
                <NavItem
                  to="/monitor/performance"
                  icon={Activity}
                  label="Performance"
                  active={pathname === '/monitor/performance'}
                  indent
                />
                <NavItem
                  to="/monitor/events"
                  icon={CalendarClock}
                  label="Events"
                  active={pathname === '/monitor/events'}
                  indent
                />
                <NavItem
                  to="/monitor/tasks"
                  icon={ListTodo}
                  label="Tasks"
                  active={pathname === '/monitor/tasks'}
                  indent
                />
              </div>
            )}
          </div>
        )}

        {/* Workspaces section */}
        <SectionHeader label="Workspaces" expanded={wsOpen} onToggle={toggleWs} />
        {wsOpen && (
          <div className="space-y-0.5">
            <NavItem
              to="/workspaces"
              icon={Box}
              label="All Workspaces"
              active={pathname === '/workspaces'}
              indent
            />
            {/* Individual workspace entries */}
            {workspaces.map((ws) => (
              <Link
                key={ws.uid}
                to="/workspace/$uid"
                params={{ uid: ws.uid }}
                className={cn(
                  'flex items-center gap-2 rounded px-3 py-1 pl-10 text-xs transition-colors',
                  pathname === `/workspace/${ws.uid}`
                    ? 'bg-nav-active text-white'
                    : 'text-nav-foreground hover:bg-nav-hover',
                )}
              >
                <StatusDot running={ws.running} creating={ws.creating} />
                <span className="truncate">{ws.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Storage section */}
        <div className="mt-1">
          <NavItem
            to="/storage"
            icon={HardDrive}
            label="Storage"
            active={pathname === '/storage'}
          />
        </div>

        {/* Manage section */}
        <SectionHeader label="Manage" expanded={manageOpen} onToggle={toggleManage} />
        {manageOpen && (
          <div className="space-y-0.5">
            <NavItem
              to="/manage/defaults"
              icon={Settings}
              label="Defaults"
              active={pathname === '/manage/defaults'}
              indent
            />
            <NavItem
              to="/manage/schedules"
              icon={Clock}
              label="Schedules"
              active={pathname === '/manage/schedules'}
              indent
            />
            <NavItem
              to="/manage/presets"
              icon={Bookmark}
              label="Presets"
              active={pathname === '/manage/presets'}
              indent
            />
            <NavItem
              to="/manage/expiry"
              icon={Timer}
              label="Expiry"
              active={pathname === '/manage/expiry'}
              indent
            />
            <NavItem
              to="/manage/quota"
              icon={Gauge}
              label="Quota & Limits"
              active={pathname === '/manage/quota'}
              indent
            />
          </div>
        )}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-nav-border px-3 py-3">
        {user && (
          <div className="mb-2 truncate text-xs text-nav-muted">
            {user}
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-nav-foreground hover:bg-nav-hover hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
