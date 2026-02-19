import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AggregatedEvent {
  type: string
  reason: string
  workspace: string
  age: string
  message: string
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchAllEvents = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AggregatedEvent[]> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const {
      listWorkspacePods,
      getWorkspaceName,
      getPodEvents,
    } = await import('@workspacekit/k8s')

    const pods = await listWorkspacePods()
    const allEvents: AggregatedEvent[] = []

    for (const pod of pods) {
      const podName = pod.metadata?.name ?? ''
      const wsName = getWorkspaceName(pod)
      if (!podName) continue

      const events = await getPodEvents(podName)
      for (const e of events) {
        allEvents.push({
          type: e.type,
          reason: e.reason,
          workspace: wsName,
          age: e.age,
          message: e.message,
        })
      }
    }

    // Sort newest first (by age text — simple heuristic)
    allEvents.reverse()
    return allEvents
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/monitor/events')({
  loader: async () => {
    const events = await fetchAllEvents()
    return { events }
  },
  component: EventsPage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function EventsPage() {
  const { events } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Events</h1>

      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardContent className="pt-4">
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events recorded across any workspaces.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-32">Reason</TableHead>
                  <TableHead className="w-32">Workspace</TableHead>
                  <TableHead className="w-20">Age</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge
                        variant={
                          event.type === 'Warning' ? 'destructive' : 'secondary'
                        }
                      >
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{event.reason}</TableCell>
                    <TableCell>{event.workspace}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.age}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.message}
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
