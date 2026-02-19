import { createAPIFileRoute } from '@tanstack/react-start/api'
import { requireAuth, sanitizeError } from '~/server/auth'
import { getStats } from '~/server/stats'

export const APIRoute = createAPIFileRoute('/api/stats')({
  GET: async ({ request }) => {
    try {
      requireAuth(request)
      const stats = getStats()
      return new Response(JSON.stringify(stats), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      })
    } catch (err) {
      if (err instanceof Response) throw err
      const message =
        err instanceof Error ? err.message : 'Internal server error'
      console.error('[api/stats] Error:', err)
      return new Response(
        JSON.stringify({ ok: false, message: sanitizeError(message) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }
  },
})
