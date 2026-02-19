import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { Preset } from '@workspacekit/types'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
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
import { Trash2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchPresets = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Preset[]> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getPresets } = await import('@workspacekit/k8s')
    return getPresets()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/manage/presets')({
  loader: async () => {
    const presets = await fetchPresets()
    return { presets }
  },
  component: PresetsPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PresetsPage() {
  const { presets } = Route.useLoaderData()
  const [message, setMessage] = useState('')

  // Add form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [reqCpu, setReqCpu] = useState('500m')
  const [reqMem, setReqMem] = useState('512Mi')
  const [limCpu, setLimCpu] = useState('2')
  const [limMem, setLimMem] = useState('4Gi')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({
          action: 'save',
          name,
          description,
          repo_url: repoUrl,
          req_cpu: reqCpu,
          req_mem: reqMem,
          lim_cpu: limCpu,
          lim_mem: limMem,
        }),
      })
      const data = await res.json()
      setMessage(data.message || 'Preset saved')
      window.location.reload()
    } catch {
      setMessage('Failed to save preset')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this preset?')) return
    try {
      await fetch('/api/presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({ action: 'delete', id }),
      })
      window.location.reload()
    } catch {
      setMessage('Failed to delete preset')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Presets</h1>

      {/* Existing presets */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardContent className="pt-4">
          {presets.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No presets configured.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-40 truncate">
                      {p.description || '-'}
                    </TableCell>
                    <TableCell className="text-xs max-w-40 truncate">
                      {p.repo_url || '-'}
                    </TableCell>
                    <TableCell className="tabular-nums text-xs">
                      {p.req_cpu}/{p.lim_cpu}
                    </TableCell>
                    <TableCell className="tabular-nums text-xs">
                      {p.req_mem}/{p.lim_mem}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(p.id)}
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

      {/* Add preset form */}
      <Card className="max-w-lg border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Create Preset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-preset" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Repository URL</Label>
                <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">CPU Req</Label>
                <Input value={reqCpu} onChange={(e) => setReqCpu(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">CPU Lim</Label>
                <Input value={limCpu} onChange={(e) => setLimCpu(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Mem Req</Label>
                <Input value={reqMem} onChange={(e) => setReqMem(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Mem Lim</Label>
                <Input value={limMem} onChange={(e) => setLimMem(e.target.value)} />
              </div>
            </div>
            {message && <p className="text-sm text-success">{message}</p>}
            <div className="flex justify-end">
              <Button type="submit">Save Preset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
