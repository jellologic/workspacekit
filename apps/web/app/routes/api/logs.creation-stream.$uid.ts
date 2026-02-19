import { createAPIFileRoute } from '@tanstack/react-start/api'
import { coreV1, namespace, getPod, isPodReady } from '@workspacekit/k8s'
import type { CreationStepId, CreationStepStatus } from '@workspacekit/types'
import { requireAuth, sanitizeError } from '~/server/auth'
import { getCreationState, updateStep, finishCreationLog, appendCreationLog } from '~/server/logs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const STEP_MARKER_RE = /^@@STEP:(\w+):([\w-]+)$/

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const APIRoute = createAPIFileRoute('/api/logs/creation-stream/$uid')({
  GET: async ({ request, params }) => {
    try {
      requireAuth(request)

      const { uid } = params
      if (!uid) {
        return fail('Missing uid parameter')
      }

      const podName = `ws-${uid}`
      const encoder = new TextEncoder()
      let lastInitLogLen = 0
      let lastMainLogLen = 0
      let lastLinesSent = 0

      const stream = new ReadableStream({
        start(controller) {
          function send(event: string, data: unknown) {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            )
          }

          // Send initial state
          const state = getCreationState(uid)
          if (state) {
            send('steps', state.steps)
            if (state.lines.length > 0) {
              for (const line of state.lines) {
                send('log', line)
              }
              lastLinesSent = state.lines.length
            }
          }

          const pollInterval = setInterval(async () => {
            try {
              const pod = await getPod(podName)

              // --- Detect cloning step from init container status ---
              if (pod) {
                const initStatuses = pod.status?.initContainerStatuses ?? []
                const gitClone = initStatuses.find((s) => s.name === 'git-clone')
                if (gitClone) {
                  if (gitClone.state?.running) {
                    updateStep(uid, 'cloning', 'in-progress')
                  } else if (gitClone.state?.terminated) {
                    if (gitClone.state.terminated.exitCode === 0) {
                      updateStep(uid, 'cloning', 'completed')
                    } else {
                      updateStep(uid, 'cloning', 'error')
                    }
                  }
                }

                // --- Stream init container logs (git clone output) ---
                try {
                  const initLog = await coreV1.readNamespacedPodLog({
                    name: podName,
                    namespace,
                    container: 'git-clone',
                    tailLines: 500,
                  })
                  const initText = typeof initLog === 'string' ? initLog : String(initLog)
                  const initLines = initText.split('\n').filter((l) => l.trim())
                  if (initLines.length > lastInitLogLen) {
                    for (let i = lastInitLogLen; i < initLines.length; i++) {
                      appendCreationLog(uid, initLines[i])
                    }
                    lastInitLogLen = initLines.length
                  }
                } catch {
                  // Init container may not have started yet
                }

                // --- Stream main container logs and detect step markers ---
                try {
                  const mainLog = await coreV1.readNamespacedPodLog({
                    name: podName,
                    namespace,
                    container: 'dev',
                    tailLines: 500,
                  })
                  const mainText = typeof mainLog === 'string' ? mainLog : String(mainLog)
                  const mainLines = mainText.split('\n').filter((l) => l.trim())
                  if (mainLines.length > lastMainLogLen) {
                    for (let i = lastMainLogLen; i < mainLines.length; i++) {
                      const line = mainLines[i]
                      const match = line.match(STEP_MARKER_RE)
                      if (match) {
                        const [, stepId, status] = match
                        updateStep(uid, stepId as CreationStepId, status as CreationStepStatus)
                      } else {
                        appendCreationLog(uid, line)
                      }
                    }
                    lastMainLogLen = mainLines.length
                  }
                } catch {
                  // Main container may not have started yet
                }

                // --- Check if pod is ready (creation complete) ---
                if (isPodReady(pod)) {
                  updateStep(uid, 'starting', 'completed')
                  finishCreationLog(uid)
                }
              }

              // --- Send updated state ---
              const currentState = getCreationState(uid)
              if (currentState) {
                send('steps', currentState.steps)

                // Send new log lines
                if (currentState.lines.length > lastLinesSent) {
                  for (let i = lastLinesSent; i < currentState.lines.length; i++) {
                    send('log', currentState.lines[i])
                  }
                  lastLinesSent = currentState.lines.length
                }

                // Check if done
                if (currentState.status === 'completed' || currentState.status === 'error') {
                  send('done', { status: currentState.status })
                  clearInterval(pollInterval)
                  controller.close()
                  return
                }
              }
            } catch {
              // Pod may not exist yet, keep polling
            }
          }, 2000)

          request.signal.addEventListener('abort', () => {
            clearInterval(pollInterval)
            try {
              controller.close()
            } catch {
              // Already closed
            }
          })
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } catch (err) {
      if (err instanceof Response) throw err
      const message = err instanceof Error ? err.message : 'Internal server error'
      console.error('[api/logs/creation-stream] Error:', err)
      return fail(sanitizeError(message), 500)
    }
  },
})
