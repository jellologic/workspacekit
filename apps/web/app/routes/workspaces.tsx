import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useCallback, useMemo } from 'react'
import type { Workspace, SystemStats, Settings } from '@workspacekit/types'
import { humanBytes } from '~/lib/utils'
import { cn } from '~/lib/cn'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '~/components/ui/context-menu'
import { ActionToolbar, type ViewMode } from '~/components/action-toolbar'
import { addTask, updateTask } from '~/lib/task-store'
import {
  Play,
  Square,
  Trash2,
  RotateCcw,
  ExternalLink,
  Copy,
  ArrowUpDown,
  GitBranch,
  User,
  Box,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchWorkspaces = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Workspace[]> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getWorkspaces } = await import('~/server/workspaces')
    return getWorkspaces()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/workspaces')({
  loader: async () => {
    const workspaces = await fetchWorkspaces()
    return { workspaces }
  },
  component: WorkspacesPage,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusColor(ws: Workspace) {
  if (ws.creating) return 'warning'
  if (ws.running) return 'default'
  if (ws.status === 'Failed' || ws.status === 'Error') return 'destructive'
  return 'secondary'
}

function statusLabel(ws: Workspace) {
  if (ws.creating) return 'Creating'
  if (ws.running) return 'Running'
  if (ws.status === 'Failed' || ws.status === 'Error') return ws.status
  return 'Stopped'
}

function StatusDot({ ws }: { ws: Workspace }) {
  if (ws.creating) return <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
  if (ws.running) return <span className="h-2 w-2 rounded-full bg-success" />
  if (ws.status === 'Failed' || ws.status === 'Error')
    return <span className="h-2 w-2 rounded-full bg-destructive" />
  return <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
}

type SortCol = 'status' | 'name' | 'cpu' | 'memory' | 'owner' | 'repo' | 'branch' | 'age'
type SortDir = 'asc' | 'desc'

function sortWorkspaces(
  list: Workspace[],
  col: SortCol,
  dir: SortDir,
): Workspace[] {
  const sorted = [...list]
  sorted.sort((a, b) => {
    let cmp = 0
    switch (col) {
      case 'status':
        cmp = statusLabel(a).localeCompare(statusLabel(b))
        break
      case 'name':
        cmp = a.name.localeCompare(b.name)
        break
      case 'cpu':
        cmp = (a.usage?.cpu ?? '').localeCompare(b.usage?.cpu ?? '')
        break
      case 'memory':
        cmp = (a.usage?.memory ?? '').localeCompare(b.usage?.memory ?? '')
        break
      case 'owner':
        cmp = (a.owner ?? '').localeCompare(b.owner ?? '')
        break
      case 'repo':
        cmp = (a.repo ?? '').localeCompare(b.repo ?? '')
        break
      case 'branch':
        cmp = (a.branch ?? '').localeCompare(b.branch ?? '')
        break
      case 'age':
        cmp = (a.last_accessed ?? '').localeCompare(b.last_accessed ?? '')
        break
    }
    return dir === 'asc' ? cmp : -cmp
  })
  return sorted
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function WorkspacesPage() {
  const { workspaces } = Route.useLoaderData()
  const router = useRouter()

  // --- View mode ---
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [filterText, setFilterText] = useState('')
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: 'name',
    dir: 'asc',
  })

  // --- Selection ---
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === workspaces.length
        ? new Set()
        : new Set(workspaces.map((w) => w.name)),
    )
  }, [workspaces])

  // --- Filtered + sorted list ---
  const filteredList = useMemo(() => {
    let list = workspaces
    if (filterText) {
      const lower = filterText.toLowerCase()
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(lower) ||
          (w.repo ?? '').toLowerCase().includes(lower) ||
          (w.owner ?? '').toLowerCase().includes(lower),
      )
    }
    return sortWorkspaces(list, sort.col, sort.dir)
  }, [workspaces, filterText, sort])

  const selectedWorkspaces = workspaces.filter((w) => selected.has(w.name))

  // --- Create dialog ---
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRepo, setFormRepo] = useState('')
  const [formBranch, setFormBranch] = useState('main')
  const [formImage, setFormImage] = useState('')
  const [formReqCpu, setFormReqCpu] = useState('')
  const [formReqMem, setFormReqMem] = useState('')
  const [formLimCpu, setFormLimCpu] = useState('')
  const [formLimMem, setFormLimMem] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setCreating(true)
    const taskId = addTask('create', formName || 'new-workspace')
    try {
      const body: Record<string, string> = { repo: formRepo }
      if (formName) body.name = formName
      if (formImage) body.image = formImage
      if (formBranch) body.branch = formBranch
      if (formReqCpu) body.req_cpu = formReqCpu
      if (formReqMem) body.req_mem = formReqMem
      if (formLimCpu) body.lim_cpu = formLimCpu
      if (formLimMem) body.lim_mem = formLimMem

      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({ action: 'create', ...body }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Create failed' }))
        throw new Error(data.message || 'Create failed')
      }
      const result = await res.json().catch(() => null)
      updateTask(taskId, { status: 'completed' })
      if (result?.uid) {
        window.location.href = `/workspace/${result.uid}`
      } else {
        window.location.reload()
      }
    } catch (err: unknown) {
      updateTask(taskId, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      setFormError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCreating(false)
    }
  }

  // --- Action handlers ---
  const fireAction = async (
    action: string,
    targets: Workspace[],
  ) => {
    if (targets.length === 0) return

    if (action === 'open-vscode') {
      for (const ws of targets) {
        if (ws.running && ws.port > 0) {
          window.open(
            `http://${window.location.hostname}:${ws.port}/?tkn=${ws.uid}&folder=/workspace/${ws.name}`,
            '_blank',
          )
        }
      }
      return
    }

    if (action === 'delete') {
      if (
        !confirm(
          `Delete ${targets.length} workspace(s)? This cannot be undone.`,
        )
      ) {
        return
      }
    }

    // Map to bulk or single action
    const bulkTargets = targets.map((w) => ({
      name: w.name,
      pod: w.pod,
      uid: w.uid,
    }))

    for (const ws of targets) {
      const taskId = addTask(
        action as 'start' | 'stop' | 'delete' | 'rebuild',
        ws.name,
      )
      try {
        if (['start', 'stop', 'delete'].includes(action)) {
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'workspacekit',
            },
            body: JSON.stringify({
              action,
              name: ws.name,
              pod: ws.pod,
              uid: ws.uid,
              repo: ws.repo,
              owner: ws.owner,
            }),
          })
        } else if (action === 'rebuild') {
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'workspacekit',
            },
            body: JSON.stringify({
              action: 'rebuild',
              name: ws.name,
              pod: ws.pod,
              uid: ws.uid,
              repo: ws.repo,
              owner: ws.owner,
            }),
          })
        } else if (action === 'duplicate') {
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'workspacekit',
            },
            body: JSON.stringify({
              action: 'duplicate',
              source_pod: ws.pod,
              source_name: ws.name,
              source_uid: ws.uid,
              new_name: `${ws.name}-copy`,
              repo: ws.repo,
            }),
          })
        }
        updateTask(taskId, { status: 'completed' })
      } catch (err) {
        updateTask(taskId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
    setSelected(new Set())
    window.location.reload()
  }

  // --- Sort toggle ---
  const toggleSort = (col: SortCol) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' },
    )
  }

  // --- Context menu actions ---
  const contextAction = (action: string, ws: Workspace) => {
    fireAction(action, [ws])
  }

  function SortHeader({ col, label }: { col: SortCol; label: string }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground"
        onClick={() => toggleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <ArrowUpDown className="h-3 w-3" />
        </span>
      </TableHead>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Workspaces</h1>

      {/* Action toolbar */}
      <ActionToolbar
        selected={selectedWorkspaces}
        onAction={fireAction}
        onCreateClick={() => setDialogOpen(true)}
        onRefresh={() => window.location.reload()}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterText={filterText}
        onFilterChange={setFilterText}
      />

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === workspaces.length && workspaces.length > 0}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                </TableHead>
                <SortHeader col="status" label="Status" />
                <SortHeader col="name" label="Name" />
                <SortHeader col="cpu" label="CPU" />
                <SortHeader col="memory" label="Memory" />
                <SortHeader col="owner" label="Owner" />
                <SortHeader col="repo" label="Repository" />
                <SortHeader col="branch" label="Branch" />
                <SortHeader col="age" label="Age" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {workspaces.length === 0
                      ? 'No workspaces found.'
                      : 'No workspaces match the filter.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((ws) => (
                  <ContextMenu key={ws.name}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className={cn(
                          'cursor-default',
                          selected.has(ws.name) && 'bg-accent/50',
                        )}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.has(ws.name)}
                            onChange={() => toggleSelect(ws.name)}
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <StatusDot ws={ws} />
                            <span className="text-xs">{statusLabel(ws)}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/workspace/$uid"
                            params={{ uid: ws.uid }}
                            className="font-medium text-primary hover:underline"
                          >
                            {ws.name}
                          </Link>
                        </TableCell>
                        <TableCell className="tabular-nums text-xs">
                          {ws.usage?.cpu ?? '-'}
                        </TableCell>
                        <TableCell className="tabular-nums text-xs">
                          {ws.usage?.memory ?? '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {ws.owner || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                          {ws.repo
                            ? ws.repo
                                .replace(/^https?:\/\/(github\.com\/)?/, '')
                                .replace(/\.git$/, '')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {ws.branch || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {ws.last_accessed || '-'}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {ws.running && ws.port > 0 && (
                        <ContextMenuItem
                          onClick={() => contextAction('open-vscode', ws)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open VSCode
                        </ContextMenuItem>
                      )}
                      {!ws.running && !ws.creating && (
                        <ContextMenuItem
                          onClick={() => contextAction('start', ws)}
                        >
                          <Play className="h-3.5 w-3.5 text-success" />
                          Start
                        </ContextMenuItem>
                      )}
                      {ws.running && (
                        <ContextMenuItem
                          onClick={() => contextAction('stop', ws)}
                        >
                          <Square className="h-3.5 w-3.5 text-warning" />
                          Stop
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem
                        onClick={() => contextAction('rebuild', ws)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Rebuild
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => contextAction('duplicate', ws)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() => contextAction('delete', ws)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card view */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredList.length === 0 ? (
            <Card className="col-span-full border-border bg-card shadow-[var(--shadow-card)]">
              <CardContent className="py-12 text-center">
                <Box className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  {workspaces.length === 0
                    ? 'No workspaces found.'
                    : 'No workspaces match the filter.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredList.map((ws) => (
              <ContextMenu key={ws.name}>
                <ContextMenuTrigger asChild>
                  <Card
                    className={cn(
                      'border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-panel)]',
                      selected.has(ws.name) && 'ring-2 ring-primary/30',
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected.has(ws.name)}
                            onChange={() => toggleSelect(ws.name)}
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                          />
                          <Link
                            to="/workspace/$uid"
                            params={{ uid: ws.uid }}
                            className="text-sm font-semibold text-foreground hover:text-primary hover:no-underline"
                          >
                            {ws.name}
                          </Link>
                          <Badge
                            variant={
                              statusColor(ws) as
                                | 'default'
                                | 'secondary'
                                | 'destructive'
                            }
                          >
                            {statusLabel(ws)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {ws.repo && (
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {ws.repo
                              .replace(/^https?:\/\/(github\.com\/)?/, '')
                              .replace(/\.git$/, '')}
                            {ws.branch && (
                              <span className="text-foreground/60">
                                :{ws.branch}
                              </span>
                            )}
                          </span>
                        )}
                        {ws.owner && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ws.owner}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {ws.resources && (
                          <>
                            <span>
                              CPU: {ws.resources.req_cpu || '-'}/
                              {ws.resources.lim_cpu || '-'}
                            </span>
                            <span>
                              Mem: {ws.resources.req_mem || '-'}/
                              {ws.resources.lim_mem || '-'}
                            </span>
                          </>
                        )}
                        {ws.usage && (
                          <>
                            <span className="text-foreground/60">|</span>
                            <span>
                              Usage: {ws.usage.cpu} CPU, {ws.usage.memory} Mem
                            </span>
                          </>
                        )}
                      </div>
                      {/* Card-level actions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ws.running && ws.port > 0 && (
                          <Button
                            size="xs"
                            onClick={() => contextAction('open-vscode', ws)}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </Button>
                        )}
                        {!ws.running && !ws.creating && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => contextAction('start', ws)}
                            className="text-success border-success/30 hover:bg-success/10"
                          >
                            <Play className="h-3 w-3" />
                            Start
                          </Button>
                        )}
                        {ws.running && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => contextAction('stop', ws)}
                            className="text-warning border-warning/30 hover:bg-warning/10"
                          >
                            <Square className="h-3 w-3" />
                            Stop
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            (window.location.href = `/workspace/${ws.uid}`)
                          }
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {ws.running && ws.port > 0 && (
                    <ContextMenuItem
                      onClick={() => contextAction('open-vscode', ws)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open VSCode
                    </ContextMenuItem>
                  )}
                  {!ws.running && !ws.creating && (
                    <ContextMenuItem onClick={() => contextAction('start', ws)}>
                      <Play className="h-3.5 w-3.5 text-success" />
                      Start
                    </ContextMenuItem>
                  )}
                  {ws.running && (
                    <ContextMenuItem onClick={() => contextAction('stop', ws)}>
                      <Square className="h-3.5 w-3.5 text-warning" />
                      Stop
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem onClick={() => contextAction('rebuild', ws)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rebuild
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => contextAction('duplicate', ws)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() => contextAction('delete', ws)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      )}

      {/* Create workspace dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            {formError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Workspace Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="my-workspace"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Repository URL</Label>
                <Input
                  value={formRepo}
                  onChange={(e) => setFormRepo(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Branch</Label>
                <Input
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Image (optional)</Label>
                <Input
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="mcr.microsoft.com/devcontainers/base:ubuntu"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">CPU Request</Label>
                <Input
                  value={formReqCpu}
                  onChange={(e) => setFormReqCpu(e.target.value)}
                  placeholder="500m"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">CPU Limit</Label>
                <Input
                  value={formLimCpu}
                  onChange={(e) => setFormLimCpu(e.target.value)}
                  placeholder="2000m"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Mem Request</Label>
                <Input
                  value={formReqMem}
                  onChange={(e) => setFormReqMem(e.target.value)}
                  placeholder="512Mi"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Mem Limit</Label>
                <Input
                  value={formLimMem}
                  onChange={(e) => setFormLimMem(e.target.value)}
                  placeholder="4Gi"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
