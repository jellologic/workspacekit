import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchExpiry = createServerFn({ method: 'GET' }).handler(
  async (): Promise<number> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { getExpiryDays } = await import('@workspacekit/k8s')
    return getExpiryDays()
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/manage/expiry')({
  loader: async () => {
    const days = await fetchExpiry()
    return { days }
  },
  component: ExpiryPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ExpiryPage() {
  const { days: initialDays } = Route.useLoaderData()

  const [days, setDays] = useState(String(initialDays))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/expiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'workspacekit',
        },
        body: JSON.stringify({ days: parseInt(days) || 0 }),
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
      <h1 className="text-lg font-semibold text-foreground">Expiry Settings</h1>

      <Card className="max-w-md border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Inactive workspace expiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs">
                Inactivity expiry (days, 0 = disabled)
              </Label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Workspaces inactive for longer than this period will be flagged
                for deletion.
              </p>
            </div>
            {message && <p className="text-sm text-success">{message}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
