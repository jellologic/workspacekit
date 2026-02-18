import { createAPIFileRoute } from '@tanstack/react-start/api'
import { requireAuth, sanitizeError } from '~/server/auth'
import { getUsageHistory } from '~/server/stats'

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

export const APIRoute = createAPIFileRoute('/api/usage-history/$pod')({
  GET: async ({ request, params }) => {
    try {
      requireAuth(request)

      const { pod } = params

      if (!pod) {
        return fail('Missing pod parameter')
      }

      const history = getUsageHistory(pod)

      return json(history)
    } catch (err) {
      if (err instanceof Response) throw err
      const message =
        err instanceof Error ? err.message : 'Internal server error'
      console.error('[api/usage-history] Error:', err)
      return fail(sanitizeError(message), 500)
    }
  },
})
