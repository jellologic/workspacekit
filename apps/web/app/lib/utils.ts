/**
 * Shared utility functions used across both server and client code.
 */

import crypto from 'node:crypto'

/**
 * Converts raw bytes into a human-readable string (e.g. "2.5Gi", "512Mi").
 */
export function humanBytes(b: number): string {
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)}Gi`
  if (b >= 1024 ** 2) return `${Math.round(b / 1024 ** 2)}Mi`
  if (b >= 1024) return `${Math.round(b / 1024)}Ki`
  return `${b}B`
}

/**
 * Parses an ISO 8601 timestamp and returns a human-readable relative age
 * such as "2d 3h" or "45m".
 */
export function formatAge(isoTimestamp: string): string {
  try {
    const created = new Date(isoTimestamp)
    const delta = Date.now() - created.getTime()
    if (delta < 0) return '0m'
    const days = Math.floor(delta / 86_400_000)
    const hours = Math.floor((delta % 86_400_000) / 3_600_000)
    const mins = Math.floor((delta % 3_600_000) / 60_000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  } catch {
    return isoTimestamp
  }
}

/**
 * Sanitises an arbitrary user string into a Kubernetes-safe name:
 * lowercase, alphanumeric + hyphens, max 50 characters.
 */
export function sanitizeName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

/**
 * Generates a short random UID suitable for workspace identifiers.
 */
export function generateUid(): string {
  return crypto.randomBytes(8).toString('hex')
}

/**
 * Extracts a workspace name from a repository URL.
 * e.g. "https://github.com/org/my-repo.git" -> "my-repo"
 */
export function repoToName(repoUrl: string): string {
  if (!repoUrl) return ''
  const parts = repoUrl
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
    .split('/')
  return sanitizeName(parts[parts.length - 1] || '')
}
