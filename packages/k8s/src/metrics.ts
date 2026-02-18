import { metricsClient, namespace } from './client.js'

export interface PodMetric {
  cpu: string
  memory: string
}

/**
 * Fetches pod metrics for the namespace using the Metrics API.
 * Returns a map of pod name to { cpu, memory }.
 */
export async function getPodMetrics(): Promise<Map<string, PodMetric>> {
  const result = new Map<string, PodMetric>()

  try {
    const metricsResponse = await metricsClient.getPodMetrics(namespace)
    for (const item of metricsResponse.items) {
      const podName = item.metadata?.name ?? ''
      if (!podName) continue

      let totalCpuMillis = 0
      let totalMemBytes = 0

      for (const container of item.containers ?? []) {
        const cpu = container.usage?.['cpu'] ?? '0'
        const mem = container.usage?.['memory'] ?? '0'
        totalCpuMillis += parseCpuValue(cpu)
        totalMemBytes += parseMemValue(mem)
      }

      result.set(podName, {
        cpu: `${totalCpuMillis}m`,
        memory: formatMemory(totalMemBytes),
      })
    }
  } catch {
    // Metrics API may not be available; return empty map
  }

  return result
}

/**
 * Parses a CPU value string into millicores.
 * "250m" -> 250, "2" -> 2000, "0.5" -> 500, "100n" -> 0
 */
export function parseCpuValue(s: string): number {
  if (!s) return 0
  const str = s.trim()

  if (str.endsWith('n')) {
    // nanocores -> millicores
    return Math.round(parseInt(str.slice(0, -1), 10) / 1_000_000)
  }
  if (str.endsWith('u')) {
    // microcores -> millicores
    return Math.round(parseInt(str.slice(0, -1), 10) / 1_000)
  }
  if (str.endsWith('m')) {
    return parseInt(str.slice(0, -1), 10)
  }

  // Whole cores or fractional cores
  const val = parseFloat(str)
  return isNaN(val) ? 0 : Math.round(val * 1000)
}

/**
 * Parses a memory value string into bytes.
 * "512Mi" -> 536870912, "1Gi" -> 1073741824, "128974848" -> 128974848
 */
export function parseMemValue(s: string): number {
  if (!s) return 0
  const str = s.trim()

  const units: Record<string, number> = {
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    Pi: 1024 ** 5,
    Ei: 1024 ** 6,
    k: 1000,
    M: 1000 ** 2,
    G: 1000 ** 3,
    T: 1000 ** 4,
    P: 1000 ** 5,
    E: 1000 ** 6,
  }

  // Check binary suffixes first (two-char), then SI suffixes (one-char)
  for (const [suffix, multiplier] of Object.entries(units)) {
    if (str.endsWith(suffix)) {
      const numStr = str.slice(0, -suffix.length)
      const val = parseFloat(numStr)
      return isNaN(val) ? 0 : Math.round(val * multiplier)
    }
  }

  // Plain bytes (or 'e' notation like "128974848")
  const val = parseFloat(str)
  return isNaN(val) ? 0 : Math.round(val)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats bytes into a human-readable memory string with Mi suffix.
 */
function formatMemory(bytes: number): string {
  const mi = bytes / (1024 * 1024)
  if (mi >= 1024) {
    const gi = mi / 1024
    return `${gi.toFixed(1)}Gi`
  }
  return `${Math.round(mi)}Mi`
}
