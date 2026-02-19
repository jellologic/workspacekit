import { useState, useEffect, useRef } from 'react'
import type { CreationStep } from '@workspacekit/types'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/cn'

interface CreationProgressProps {
  uid: string
  onComplete?: () => void
}

function StepIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (status === 'in-progress') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20 text-destructive">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  }
  // pending
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    </div>
  )
}

export function CreationProgress({ uid, onComplete }: CreationProgressProps) {
  const [steps, setSteps] = useState<CreationStep[]>([])
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/logs/creation-stream/${encodeURIComponent(uid)}`)
    eventSourceRef.current = es

    es.addEventListener('steps', (e) => {
      try {
        const parsed = JSON.parse(e.data) as CreationStep[]
        setSteps(parsed)
      } catch {
        // ignore parse errors
      }
    })

    es.addEventListener('log', (e) => {
      try {
        const line = JSON.parse(e.data) as string
        setLines((prev) => [...prev, line])
        requestAnimationFrame(() => {
          if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight
          }
        })
      } catch {
        // ignore
      }
    })

    es.addEventListener('done', (e) => {
      try {
        const data = JSON.parse(e.data) as { status: string }
        setDone(true)
        es.close()
        if (data.status === 'completed' && onComplete) {
          // Short delay so user can see the final state
          setTimeout(onComplete, 1500)
        }
      } catch {
        // ignore
      }
    })

    es.onerror = () => {
      // Connection lost — don't auto-close, EventSource will reconnect
    }

    return () => {
      es.close()
    }
  }, [uid, onComplete])

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Steps */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Creation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'mt-1 w-0.5 flex-1 min-h-[20px]',
                        step.status === 'completed' ? 'bg-success/40' : 'bg-border',
                      )}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      'text-sm font-medium leading-6',
                      step.status === 'in-progress' && 'text-primary',
                      step.status === 'completed' && 'text-success',
                      step.status === 'error' && 'text-destructive',
                      step.status === 'pending' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {done && (
            <p className="mt-4 text-sm text-success font-medium">
              Workspace ready — loading...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Log output */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logRef}
            className="max-h-[500px] overflow-auto rounded-lg bg-[#1a1a2e] p-4 font-mono text-xs leading-relaxed text-green-400/80"
          >
            {lines.length === 0 ? (
              <span className="text-muted-foreground">
                Waiting for log output...
              </span>
            ) : (
              lines.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
