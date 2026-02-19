import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useEffect, useRef } from 'react'
import type { SystemStats } from '@workspacekit/types'
import { humanBytes } from '~/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Sparkline } from '~/components/charts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SystemStats | null> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getStats } = await import('~/server/stats')
    return getStats()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/monitor/performance')({
  loader: async () => {
    const stats = await fetchStats()
    return { stats }
  },
  component: PerformancePage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PerformancePage() {
  const { stats: initialStats } = Route.useLoaderData()
  const [stats, setStats] = useState<SystemStats | null>(initialStats)
  const cpuHistory = useRef<number[]>([])
  const memHistory = useRef<number[]>([])
  const diskHistory = useRef<number[]>([])
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (initialStats) {
      cpuHistory.current = [initialStats.cpu?.['_system'] ?? 0]
      const memPct =
        initialStats.mem.total > 0
          ? Math.round(
              ((initialStats.mem.total - initialStats.mem.available) /
                initialStats.mem.total) *
                100,
            )
          : 0
      memHistory.current = [memPct]
      diskHistory.current = [
        initialStats.disk.total > 0
          ? Math.round((initialStats.disk.used / initialStats.disk.total) * 100)
          : 0,
      ]
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const data = (await res.json()) as SystemStats
        setStats(data)

        cpuHistory.current = [
          ...cpuHistory.current.slice(-59),
          data.cpu?.['_system'] ?? 0,
        ]
        const memPct =
          data.mem.total > 0
            ? Math.round(
                ((data.mem.total - data.mem.available) / data.mem.total) * 100,
              )
            : 0
        memHistory.current = [...memHistory.current.slice(-59), memPct]
        diskHistory.current = [
          ...diskHistory.current.slice(-59),
          data.disk.total > 0
            ? Math.round((data.disk.used / data.disk.total) * 100)
            : 0,
        ]
        forceUpdate((n) => n + 1)
      } catch {
        // ignore
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Performance</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              CPU ({stats?.cpu?.['_system'] ?? 0}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline
              data={cpuHistory.current}
              width={300}
              height={100}
              color="var(--color-primary)"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.ncpu ?? 0} cores | Load:{' '}
              {stats?.load
                ? `${stats.load[0].toFixed(2)} / ${stats.load[1].toFixed(2)} / ${stats.load[2].toFixed(2)}`
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Memory (
              {stats && stats.mem.total > 0
                ? Math.round(
                    ((stats.mem.total - stats.mem.available) / stats.mem.total) *
                      100,
                  )
                : 0}
              %)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline
              data={memHistory.current}
              width={300}
              height={100}
              color="var(--color-success)"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {stats
                ? `${humanBytes(stats.mem.total - stats.mem.available)} / ${humanBytes(stats.mem.total)}`
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Disk (
              {stats && stats.disk.total > 0
                ? Math.round((stats.disk.used / stats.disk.total) * 100)
                : 0}
              %)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline
              data={diskHistory.current}
              width={300}
              height={100}
              color="var(--color-warning)"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {stats
                ? `${humanBytes(stats.disk.used)} / ${humanBytes(stats.disk.total)}`
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top processes */}
      {stats?.procs && stats.procs.length > 0 && (
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Top Processes (by RSS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">PID</TableHead>
                  <TableHead className="w-20">User</TableHead>
                  <TableHead className="w-16 text-right">CPU%</TableHead>
                  <TableHead className="w-16 text-right">Mem%</TableHead>
                  <TableHead className="w-20 text-right">RSS</TableHead>
                  <TableHead>Command</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.procs.slice(0, 20).map((proc, i) => (
                  <TableRow key={i}>
                    <TableCell className="tabular-nums">{proc.pid}</TableCell>
                    <TableCell>{proc.user}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {proc.cpu}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {proc.mem}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {humanBytes(proc.rss)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {proc.cmd}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
