import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Defaults {
  req_cpu: string
  req_mem: string
  lim_cpu: string
  lim_mem: string
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchDefaults = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Defaults> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getWorkspaceDefaults } = await import('@workspacekit/k8s')
    return getWorkspaceDefaults()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/manage/defaults')({
  loader: async () => {
    const defaults = await fetchDefaults()
    return { defaults }
  },
  component: DefaultsPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function DefaultsPage() {
  const { defaults } = Route.useLoaderData()

  const [reqCpu, setReqCpu] = useState(defaults.req_cpu)
  const [reqMem, setReqMem] = useState(defaults.req_mem)
  const [limCpu, setLimCpu] = useState(defaults.lim_cpu)
  const [limMem, setLimMem] = useState(defaults.lim_mem)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({
          action: 'save-defaults',
          req_cpu: reqCpu,
          req_mem: reqMem,
          lim_cpu: limCpu,
          lim_mem: limMem,
        }),
      })
      const data = await res.json()
      setMessage(data.message || 'Saved')
    } catch {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Workspace Defaults</h1>

      <Card className="max-w-lg border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Default resource allocations for new workspaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">CPU Request</Label>
                <Input value={reqCpu} onChange={(e) => setReqCpu(e.target.value)} placeholder="500m" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">CPU Limit</Label>
                <Input value={limCpu} onChange={(e) => setLimCpu(e.target.value)} placeholder="2000m" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Memory Request</Label>
                <Input value={reqMem} onChange={(e) => setReqMem(e.target.value)} placeholder="512Mi" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Memory Limit</Label>
                <Input value={limMem} onChange={(e) => setLimMem(e.target.value)} placeholder="4Gi" />
              </div>
            </div>
            {message && (
              <p className="text-sm text-success">{message}</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Defaults'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
