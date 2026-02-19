import { createFileRoute } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  clearTasks,
  type TaskEntry,
} from '~/lib/task-store'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/monitor/tasks')({
  component: TasksPage,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(ms: number): string {
  const delta = Date.now() - ms
  if (delta < 5_000) return 'just now'
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`
  return `${Math.floor(delta / 3_600_000)}h ago`
}

function TaskStatusIcon({ status }: { status: TaskEntry['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TasksPage() {
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Task History</h1>
        {tasks.length > 0 && (
          <Button variant="outline" size="xs" onClick={clearTasks}>
            <Trash2 className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardContent className="pt-4">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent tasks recorded.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Status</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead className="w-24">Started</TableHead>
                  <TableHead className="w-24">Completed</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <TaskStatusIcon status={task.status} />
                    </TableCell>
                    <TableCell className="capitalize font-medium">
                      {task.action}
                    </TableCell>
                    <TableCell>{task.workspace}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {relativeTime(task.startedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {task.completedAt ? relativeTime(task.completedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-destructive text-xs max-w-xs truncate">
                      {task.error || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
