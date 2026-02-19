/**
 * Ring buffer for workspace creation logs with step tracking.
 *
 * Mirrors the Python LogBuffer pattern: keeps up to MAX_LINES per workspace
 * and automatically cleans up entries older than CLEANUP_AGE_MS.
 *
 * All functions are keyed by workspace UID (not name).
 */

import type { CreationStep, CreationStepId, CreationStepStatus } from '@workspacekit/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of log lines stored per workspace. */
const MAX_LINES = 500

/** Entries older than 30 minutes are eligible for automatic cleanup. */
const CLEANUP_AGE_MS = 30 * 60 * 1000

/** How often the cleanup sweep runs (every 5 minutes). */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

/** The 5 creation steps in order. */
const STEP_DEFINITIONS: Array<{ id: CreationStepId; label: string }> = [
  { id: 'provisioning', label: 'Provisioning resources' },
  { id: 'cloning', label: 'Cloning repository' },
  { id: 'features', label: 'Installing features' },
  { id: 'postcreate', label: 'Running postCreateCommand' },
  { id: 'starting', label: 'Starting workspace' },
]

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

interface LogEntry {
  lines: string[]
  steps: CreationStep[]
  status: 'creating' | 'completed' | 'error'
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
 * Initializes a creation log entry with all 5 steps in pending state.
 */
export function initCreationLog(uid: string): void {
  logStore.set(uid, {
    lines: [],
    steps: STEP_DEFINITIONS.map((s) => ({ ...s, status: 'pending' as CreationStepStatus })),
    status: 'creating',
    createdAt: Date.now(),
  })
}

/**
 * Updates a single step's status.
 */
export function updateStep(uid: string, stepId: CreationStepId, status: CreationStepStatus): void {
  const entry = logStore.get(uid)
  if (!entry) return
  const step = entry.steps.find((s) => s.id === stepId)
  if (step) step.status = status
}

/**
 * Returns the full creation state: lines, steps, and overall status.
 */
export function getCreationState(uid: string): { lines: string[]; steps: CreationStep[]; status: string } | null {
  const entry = logStore.get(uid)
  if (!entry) return null
  return { lines: [...entry.lines], steps: [...entry.steps], status: entry.status }
}

/**
 * Appends a single log line for the given workspace.
 * Creates the entry if it does not exist. Trims to MAX_LINES (FIFO).
 */
export function appendCreationLog(uid: string, line: string): void {
  let entry = logStore.get(uid)
  if (!entry) {
    entry = {
      lines: [],
      steps: STEP_DEFINITIONS.map((s) => ({ ...s, status: 'pending' as CreationStepStatus })),
      status: 'creating',
      createdAt: Date.now(),
    }
    logStore.set(uid, entry)
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
export function getCreationLog(uid: string): string[] {
  return logStore.get(uid)?.lines ?? []
}

/**
 * Removes the log entry for the given workspace.
 */
export function clearCreationLog(uid: string): void {
  logStore.delete(uid)
}

/**
 * Returns true if there are log lines stored for the given workspace.
 */
export function hasCreationLog(uid: string): boolean {
  const entry = logStore.get(uid)
  return entry !== undefined && entry.lines.length > 0
}

/**
 * Marks a creation log as finished by appending a final status line
 * and updating the overall status.
 */
export function finishCreationLog(uid: string, error?: boolean): void {
  const entry = logStore.get(uid)
  if (entry) {
    entry.status = error ? 'error' : 'completed'
  }
  appendCreationLog(uid, '[done]')
}
