import { createAPIFileRoute } from '@tanstack/react-start/api'
import { requireAuth, sanitizeError } from '~/server/auth'
import { getCreationLog } from '~/server/logs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function fail(message: string, status = 400): Response {
  return json({ ok: false, message }, status)
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const APIRoute = createAPIFileRoute('/api/logs/creation/$ws')({
  GET: async ({ request, params }) => {
    try {
      requireAuth(request)

      const { ws } = params

      if (!ws) {
        return fail('Missing workspace parameter')
      }

      const lines = getCreationLog(ws)

      return json(lines)
    } catch (err) {
      if (err instanceof Response) throw err
      const message =
        err instanceof Error ? err.message : 'Internal server error'
      console.error('[api/logs/creation] Error:', err)
      return fail(sanitizeError(message), 500)
    }
  },
})
