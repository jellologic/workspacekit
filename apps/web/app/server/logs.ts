/**
 * Ring buffer for workspace creation logs.
 *
 * Mirrors the Python LogBuffer pattern: keeps up to MAX_LINES per workspace
 * and automatically cleans up entries older than CLEANUP_AGE_MS.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of log lines stored per workspace. */
const MAX_LINES = 500

/** Entries older than 30 minutes are eligible for automatic cleanup. */
const CLEANUP_AGE_MS = 30 * 60 * 1000

/** How often the cleanup sweep runs (every 5 minutes). */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

interface LogEntry {
  lines: string[]
  createdAt: number
}

const logStore = new Map<string, LogEntry>()

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * Removes log entries that were created more than CLEANUP_AGE_MS ago.
 */
function cleanupStaleEntries(): void {
  const cutoff = Date.now() - CLEANUP_AGE_MS
  for (const [key, entry] of logStore) {
    if (entry.createdAt < cutoff) {
      logStore.delete(key)
    }
  }
}

// Start the periodic cleanup timer. Using unref() so it does not prevent
// the process from exiting naturally.
const cleanupTimer = setInterval(cleanupStaleEntries, CLEANUP_INTERVAL_MS)
if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
  cleanupTimer.unref()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Appends a single log line for the given workspace.
 * Creates the entry if it does not exist. Trims to MAX_LINES (FIFO).
 */
export function appendCreationLog(workspaceName: string, line: string): void {
  let entry = logStore.get(workspaceName)
  if (!entry) {
    entry = { lines: [], createdAt: Date.now() }
    logStore.set(workspaceName, entry)
  }

  entry.lines.push(line)

  // Trim from the front if we exceed the limit
  if (entry.lines.length > MAX_LINES) {
    entry.lines = entry.lines.slice(entry.lines.length - MAX_LINES)
  }
}

/**
 * Returns all log lines for the given workspace, or an empty array if none.
 */
export function getCreationLog(workspaceName: string): string[] {
  return logStore.get(workspaceName)?.lines ?? []
}

/**
 * Removes the log entry for the given workspace.
 */
export function clearCreationLog(workspaceName: string): void {
  logStore.delete(workspaceName)
}

/**
 * Returns true if there are log lines stored for the given workspace.
 */
export function hasCreationLog(workspaceName: string): boolean {
  const entry = logStore.get(workspaceName)
  return entry !== undefined && entry.lines.length > 0
}

/**
 * Marks a creation log as finished by appending a final status line.
 * The log entry remains in the store (subject to the normal cleanup timer)
 * so the UI can poll for the completion status.
 */
export function finishCreationLog(workspaceName: string): void {
  appendCreationLog(workspaceName, '[done]')
}
