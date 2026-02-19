import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  clearTasks,
  type TaskEntry,
} from '~/lib/task-store'
import { cn } from '~/lib/cn'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(ms: number): string {
  const delta = Date.now() - ms
  if (delta < 5_000) return 'just now'
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`
  return `${Math.floor(delta / 3_600_000)}h ago`
}

// ---------------------------------------------------------------------------
// Status icon
// ---------------------------------------------------------------------------

function TaskStatusIcon({ status }: { status: TaskEntry['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
    case 'completed':
      return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
    case 'failed':
      return <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
  }
}

// ---------------------------------------------------------------------------
// Panel component
// ---------------------------------------------------------------------------

export function TasksPanel() {
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [expanded, setExpanded] = useState(false)

  // Restore expand state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wsk_tasks_expanded')
      if (stored === '1') setExpanded(true)
    } catch {
      // ignore
    }
  }, [])

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev
      try {
        localStorage.setItem('wsk_tasks_expanded', next ? '1' : '0')
      } catch {
        // ignore
      }
      return next
    })
  }

  const runningCount = tasks.filter((t) => t.status === 'running').length

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {/* Header row — always visible */}
      <button
        onClick={toggleExpanded}
        className="flex h-8 w-full items-center gap-2 px-4 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
        <span className="font-medium">Recent Tasks</span>
        {tasks.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
            {tasks.length}
          </span>
        )}
        {runningCount > 0 && (
          <span className="flex items-center gap-1 text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            {runningCount} running
          </span>
        )}
        <div className="flex-1" />
        {tasks.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              clearTasks()
            }}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="max-h-44 overflow-y-auto border-t border-border">
          {tasks.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              No recent tasks.
            </div>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="w-8 py-1.5 pl-4">
                      <TaskStatusIcon status={task.status} />
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground capitalize">
                      {task.action}
                    </td>
                    <td className="py-1.5 px-2 font-medium text-foreground">
                      {task.workspace}
                    </td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground tabular-nums pr-4">
                      {relativeTime(task.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
