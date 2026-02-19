import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { Schedule } from '@workspacekit/types'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Trash2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchSchedules = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Schedule[]> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getSchedules } = await import('@workspacekit/k8s')
    return getSchedules()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/manage/schedules')({
  loader: async () => {
    const schedules = await fetchSchedules()
    return { schedules }
  },
  component: SchedulesPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SchedulesPage() {
  const { schedules: initialSchedules } = Route.useLoaderData()
  const [schedules, setSchedules] = useState(initialSchedules)
  const [message, setMessage] = useState('')

  // Add form
  const [workspace, setWorkspace] = useState('')
  const [podName, setPodName] = useState('')
  const [action, setAction] = useState<'start' | 'stop'>('start')
  const [days, setDays] = useState('1,2,3,4,5')
  const [hour, setHour] = useState('9')
  const [minute, setMinute] = useState('0')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({
          action: 'set',
          schedule_action: action,
          workspace,
          pod_name: podName,
          days: days.split(',').map((d) => d.trim()),
          hour: parseInt(hour),
          minute: parseInt(minute),
        }),
      })
      const data = await res.json()
      setMessage(data.message || 'Schedule added')
      window.location.reload()
    } catch {
      setMessage('Failed to add schedule')
    }
  }

  const handleRemove = async (ws: string, act: string) => {
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({ action: 'remove', workspace: ws, schedule_action: act }),
      })
      window.location.reload()
    } catch {
      setMessage('Failed to remove schedule')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Schedules</h1>

      {/* Existing schedules */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardContent className="pt-4">
          {schedules.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No schedules configured.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.workspace}</TableCell>
                    <TableCell>
                      <Badge variant={s.action === 'start' ? 'default' : 'secondary'}>
                        {s.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {s.days.join(', ')}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {String(s.hour).padStart(2, '0')}:
                      {String(s.minute).padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemove(s.workspace, s.action)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add schedule form */}
      <Card className="max-w-lg border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Add Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Workspace</Label>
                <Input
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="my-workspace"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Pod Name</Label>
                <Input
                  value={podName}
                  onChange={(e) => setPodName(e.target.value)}
                  placeholder="ws-abc123"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Action</Label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as 'start' | 'stop')}
                  className="h-8 rounded border border-border bg-input px-2 text-sm"
                >
                  <option value="start">Start</option>
                  <option value="stop">Stop</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Hour</Label>
                <Input value={hour} onChange={(e) => setHour(e.target.value)} placeholder="9" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Minute</Label>
                <Input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Days (1=Mon, 7=Sun)</Label>
              <Input value={days} onChange={(e) => setDays(e.target.value)} placeholder="1,2,3,4,5" />
            </div>
            {message && <p className="text-sm text-success">{message}</p>}
            <div className="flex justify-end">
              <Button type="submit">Add Schedule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
