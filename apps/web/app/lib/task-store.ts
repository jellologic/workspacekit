/**
 * Client-side task tracker for recent operations.
 * Persists last 50 entries in localStorage and supports useSyncExternalStore.
 */

const STORAGE_KEY = 'wsk_recent_tasks'
const MAX_TASKS = 50

export interface TaskEntry {
  id: string
  action: 'create' | 'start' | 'stop' | 'delete' | 'rebuild' | 'resize' | 'duplicate'
  workspace: string
  status: 'running' | 'completed' | 'failed'
  startedAt: number
  completedAt?: number
  error?: string
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

let tasks: TaskEntry[] = []
const listeners = new Set<() => void>()

function load(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      tasks = JSON.parse(raw) as TaskEntry[]
    }
  } catch {
    tasks = []
  }
}

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // quota exceeded — ignore
  }
}

function notify(): void {
  for (const fn of listeners) fn()
}

// Initialize on module load (client-side only)
load()

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let idCounter = Date.now()

export function addTask(
  action: TaskEntry['action'],
  workspace: string,
): string {
  const id = String(++idCounter)
  const entry: TaskEntry = {
    id,
    action,
    workspace,
    status: 'running',
    startedAt: Date.now(),
  }
  tasks = [entry, ...tasks].slice(0, MAX_TASKS)
  persist()
  notify()
  return id
}

export function updateTask(
  id: string,
  update: { status: 'completed' | 'failed'; error?: string },
): void {
  tasks = tasks.map((t) =>
    t.id === id
      ? { ...t, ...update, completedAt: Date.now() }
      : t,
  )
  persist()
  notify()
}

export function getTasks(): TaskEntry[] {
  return tasks
}

export function clearTasks(): void {
  tasks = []
  persist()
  notify()
}

// ---------------------------------------------------------------------------
// useSyncExternalStore support
// ---------------------------------------------------------------------------

export function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function getSnapshot(): TaskEntry[] {
  return tasks
}

export function getServerSnapshot(): TaskEntry[] {
  return []
}
