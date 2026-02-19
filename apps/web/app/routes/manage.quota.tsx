import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { Settings } from '@workspacekit/types'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchSettings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Settings | null> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getLimitRange, getResourceQuota, getWorkspaceDefaults } =
      await import('@workspacekit/k8s')
    const [limitrange, quota, provider] = await Promise.all([
      getLimitRange(),
      getResourceQuota(),
      getWorkspaceDefaults(),
    ])
    return { provider, limitrange, quota }
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/manage/quota')({
  loader: async () => {
    const settings = await fetchSettings()
    return { settings }
  },
  component: QuotaPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function QuotaPage() {
  const { settings } = Route.useLoaderData()

  // LimitRange state
  const [lrMaxCpu, setLrMaxCpu] = useState(settings?.limitrange?.max_cpu ?? '')
  const [lrMaxMem, setLrMaxMem] = useState(settings?.limitrange?.max_mem ?? '')
  const [lrDefReqCpu, setLrDefReqCpu] = useState(settings?.limitrange?.def_req_cpu ?? '')
  const [lrDefReqMem, setLrDefReqMem] = useState(settings?.limitrange?.def_req_mem ?? '')

  // ResourceQuota state
  const [quotaReqCpu, setQuotaReqCpu] = useState(settings?.quota?.req_cpu ?? '')
  const [quotaReqMem, setQuotaReqMem] = useState(settings?.quota?.req_mem ?? '')
  const [quotaPods, setQuotaPods] = useState(settings?.quota?.pods ?? '')

  const [lrMessage, setLrMessage] = useState('')
  const [quotaMessage, setQuotaMessage] = useState('')
  const [lrSaving, setLrSaving] = useState(false)
  const [quotaSaving, setQuotaSaving] = useState(false)

  const handleSaveLimitRange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLrSaving(true)
    setLrMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({
          action: 'save-limitrange',
          max_cpu: lrMaxCpu,
          max_mem: lrMaxMem,
          def_req_cpu: lrDefReqCpu,
          def_req_mem: lrDefReqMem,
        }),
      })
      const data = await res.json()
      setLrMessage(data.message || 'Saved')
    } catch {
      setLrMessage('Failed to save')
    } finally {
      setLrSaving(false)
    }
  }

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuotaSaving(true)
    setQuotaMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({
          action: 'save-quota',
          req_cpu: quotaReqCpu,
          req_mem: quotaReqMem,
          pods: quotaPods,
        }),
      })
      const data = await res.json()
      setQuotaMessage(data.message || 'Saved')
    } catch {
      setQuotaMessage('Failed to save')
    } finally {
      setQuotaSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Quota & Limits</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* LimitRange */}
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LimitRange</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveLimitRange} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Max CPU</Label>
                  <Input value={lrMaxCpu} onChange={(e) => setLrMaxCpu(e.target.value)} placeholder="4" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Max Memory</Label>
                  <Input value={lrMaxMem} onChange={(e) => setLrMaxMem(e.target.value)} placeholder="8Gi" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Default Req CPU</Label>
                  <Input value={lrDefReqCpu} onChange={(e) => setLrDefReqCpu(e.target.value)} placeholder="500m" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Default Req Memory</Label>
                  <Input value={lrDefReqMem} onChange={(e) => setLrDefReqMem(e.target.value)} placeholder="512Mi" />
                </div>
              </div>
              {lrMessage && <p className="text-sm text-success">{lrMessage}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={lrSaving}>
                  {lrSaving ? 'Saving...' : 'Save LimitRange'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ResourceQuota */}
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ResourceQuota</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveQuota} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Request CPU</Label>
                  <Input value={quotaReqCpu} onChange={(e) => setQuotaReqCpu(e.target.value)} placeholder="8" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Request Memory</Label>
                  <Input value={quotaReqMem} onChange={(e) => setQuotaReqMem(e.target.value)} placeholder="16Gi" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Max Pods</Label>
                <Input value={quotaPods} onChange={(e) => setQuotaPods(e.target.value)} placeholder="10" />
              </div>
              {quotaMessage && <p className="text-sm text-success">{quotaMessage}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={quotaSaving}>
                  {quotaSaving ? 'Saving...' : 'Save Quota'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
