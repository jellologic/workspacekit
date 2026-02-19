import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent } from '~/components/ui/card'
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

interface PvcInfo {
  name: string
  workspace: string
  capacity: string
  status: string
  storage_class: string
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const fetchPvcs = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PvcInfo[]> => {
    const { requireServerFnAuth } = await import('~/server/auth')
    await requireServerFnAuth()
    const { listWorkspacePvcs } = await import('@workspacekit/k8s')

    const pvcs = await listWorkspacePvcs()
    return pvcs.map((pvc) => ({
      name: pvc.metadata?.name ?? '',
      workspace: pvc.metadata?.labels?.['workspace-name'] ?? '-',
      capacity: pvc.status?.capacity?.['storage'] ?? '-',
      status: pvc.status?.phase ?? 'Unknown',
      storage_class: pvc.spec?.storageClassName ?? '-',
    }))
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/storage')({
  loader: async () => {
    const pvcs = await fetchPvcs()
    return { pvcs }
  },
  component: StoragePage,
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function StoragePage() {
  const { pvcs } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Storage</h1>

      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardContent className="pt-4">
          {pvcs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No persistent volume claims found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pvcs.map((pvc) => (
                  <TableRow key={pvc.name}>
                    <TableCell className="font-mono text-xs">
                      {pvc.name}
                    </TableCell>
                    <TableCell>{pvc.workspace}</TableCell>
                    <TableCell className="tabular-nums">{pvc.capacity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pvc.status === 'Bound' ? 'default' : 'secondary'
                        }
                      >
                        {pvc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pvc.storage_class}</TableCell>
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
