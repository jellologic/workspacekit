import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useEffect, useRef } from 'react'
import type { SystemStats } from '@workspacekit/types'
import { humanBytes } from '~/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Gauge, Sparkline } from '~/components/charts'
import { Cpu, MemoryStick, HardDrive, Server, Box } from 'lucide-react'

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

const fetchWorkspaceCounts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ total: number; running: number; stopped: number; creating: number }> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getWorkspaces } = await import('~/server/workspaces')
    const workspaces = await getWorkspaces()
    return {
      total: workspaces.length,
      running: workspaces.filter((w) => w.running).length,
      stopped: workspaces.filter((w) => !w.running && !w.creating).length,
      creating: workspaces.filter((w) => w.creating).length,
    }
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, counts] = await Promise.all([
      fetchStats(),
      fetchWorkspaceCounts(),
    ])
    return { stats, counts }
  },
  component: HostSummaryPage,
})

// ---------------------------------------------------------------------------
// Ring buffer hook for sparkline data
// ---------------------------------------------------------------------------

function useRingBuffer(capacity: number) {
  const ref = useRef<number[]>([])

  const push = (value: number) => {
    ref.current = [...ref.current.slice(-(capacity - 1)), value]
  }

  return { data: ref.current, push }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function HostSummaryPage() {
  const { stats: initialStats, counts } = Route.useLoaderData()

  const [stats, setStats] = useState<SystemStats | null>(initialStats)
  const cpuHistory = useRef<number[]>([])
  const memHistory = useRef<number[]>([])
  const [, forceUpdate] = useState(0)

  // Initialize with SSR data
  useEffect(() => {
    if (initialStats) {
      const cpuPct = initialStats.cpu?.['_system'] ?? 0
      const memPct =
        initialStats.mem.total > 0
          ? Math.round(
              ((initialStats.mem.total - initialStats.mem.available) /
                initialStats.mem.total) *
                100,
            )
          : 0
      cpuHistory.current = [cpuPct]
      memHistory.current = [memPct]
    }
  }, [])

  // Poll /api/stats every 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const data = (await res.json()) as SystemStats
        setStats(data)

        const cpuPct = data.cpu?.['_system'] ?? 0
        const memPct =
          data.mem.total > 0
            ? Math.round(
                ((data.mem.total - data.mem.available) / data.mem.total) * 100,
              )
            : 0

        cpuHistory.current = [...cpuHistory.current.slice(-59), cpuPct]
        memHistory.current = [...memHistory.current.slice(-59), memPct]
        forceUpdate((n) => n + 1)
      } catch {
        // ignore fetch errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const cpuPercent = stats?.cpu?.['_system'] ?? 0
  const memPercent =
    stats && stats.mem.total > 0
      ? Math.round(
          ((stats.mem.total - stats.mem.available) / stats.mem.total) * 100,
        )
      : 0
  const diskPercent =
    stats && stats.disk.total > 0
      ? Math.round((stats.disk.used / stats.disk.total) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Host Summary</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Resource gauges (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Gauge row */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* CPU */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Gauge value={cpuPercent} label="CPU" />
                  </div>
                  <Sparkline
                    data={cpuHistory.current}
                    color="var(--color-primary)"
                  />
                  <div className="text-center text-xs text-muted-foreground">
                    {stats?.ncpu ?? 0} cores
                    {stats?.load
                      ? ` | load ${stats.load[0].toFixed(2)}`
                      : ''}
                  </div>
                </div>

                {/* Memory */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Gauge value={memPercent} label="Memory" />
                  </div>
                  <Sparkline
                    data={memHistory.current}
                    color="var(--color-success)"
                  />
                  <div className="text-center text-xs text-muted-foreground">
                    {stats
                      ? `${humanBytes(stats.mem.total - stats.mem.available)} / ${humanBytes(stats.mem.total)}`
                      : '-'}
                  </div>
                </div>

                {/* Disk */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Gauge value={diskPercent} label="Disk" />
                  </div>
                  <div className="h-10" /> {/* spacer matching sparkline height */}
                  <div className="text-center text-xs text-muted-foreground">
                    {stats
                      ? `${humanBytes(stats.disk.used)} / ${humanBytes(stats.disk.total)}`
                      : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System info table */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-0 divide-y divide-border">
                <InfoRow label="Uptime" value={stats?.uptime ?? '-'} />
                <InfoRow
                  label="Load Average"
                  value={
                    stats?.load
                      ? `${stats.load[0].toFixed(2)} / ${stats.load[1].toFixed(2)} / ${stats.load[2].toFixed(2)}`
                      : '-'
                  }
                />
                <InfoRow label="CPU Cores" value={String(stats?.ncpu ?? '-')} />
                <InfoRow
                  label="Swap"
                  value={
                    stats?.swap
                      ? `${humanBytes(stats.swap.used)} / ${humanBytes(stats.swap.total)}`
                      : '-'
                  }
                />
                <InfoRow
                  label="Workspaces"
                  value={`${counts.total} total (${counts.running} running)`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: workspace quick-stats + summary (1/3 width) */}
        <div className="flex flex-col gap-4">
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Workspace Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="Total"
                  value={counts.total}
                  icon={<Box className="h-4 w-4 text-muted-foreground" />}
                />
                <StatBox
                  label="Running"
                  value={counts.running}
                  icon={<span className="h-2.5 w-2.5 rounded-full bg-success" />}
                  valueClass="text-success"
                />
                <StatBox
                  label="Stopped"
                  value={counts.stopped}
                  icon={<span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />}
                />
                <StatBox
                  label="Creating"
                  value={counts.creating}
                  icon={<span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />}
                  valueClass="text-warning"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top processes */}
          {stats?.procs && stats.procs.length > 0 && (
            <Card className="border-border bg-card shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Processes (by RSS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-xs">
                  {stats.procs.slice(0, 8).map((proc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="w-10 text-right tabular-nums font-medium text-foreground">
                        {humanBytes(proc.rss)}
                      </span>
                      <span className="w-10 text-right tabular-nums">
                        {proc.cpu}%
                      </span>
                      <span className="truncate flex-1">{proc.cmd}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function StatBox({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string
  value: number
  icon: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-border p-3">
      {icon}
      <span className={`text-2xl font-bold tabular-nums ${valueClass ?? ''}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
