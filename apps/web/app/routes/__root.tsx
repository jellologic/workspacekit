import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
  redirect,
} from '@tanstack/react-router'
import { createServerFn, Meta, Scripts } from '@tanstack/react-start'
import { getSession } from '~/server/auth'
import { useRouterState } from '@tanstack/react-router'
import { Server, ChevronRight } from 'lucide-react'
import { Navigator } from '~/components/navigator'
import { TasksPanel } from '~/components/tasks-panel'
import globalsCss from '~/globals.css?url'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const checkAuth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ user: string; role: string } | null> => {
    const { getWebRequest } = await import('vinxi/http')
    const request = getWebRequest()
    const session = getSession(request.headers.get('cookie'))
    return session ? { user: session.user, role: session.role } : null
  },
)

/** Lightweight workspace list for the navigator sidebar. */
const fetchNavWorkspaces = createServerFn({ method: 'GET' }).handler(
  async (): Promise<
    { name: string; uid: string; running: boolean; creating: boolean }[]
  > => {
    const { getWebRequest } = await import('vinxi/http')
    const request = getWebRequest()
    const session = getSession(request.headers.get('cookie'))
    if (!session) return []

    const {
      listWorkspacePods,
      getWorkspaceName,
      getWorkspaceUid,
      isPodReady,
      listConfigMaps,
    } = await import('@workspacekit/k8s')
    const { hasCreationLog } = await import('~/server/logs')

    const [pods, savedCms] = await Promise.all([
      listWorkspacePods(),
      listConfigMaps('managed-by=workspacekit,component=saved-spec'),
    ])

    const runningUids = new Set<string>()
    const result: { name: string; uid: string; running: boolean; creating: boolean }[] =
      []

    for (const pod of pods) {
      const uid = getWorkspaceUid(pod)
      const name = getWorkspaceName(pod)
      runningUids.add(uid)
      result.push({
        name,
        uid,
        running: isPodReady(pod),
        creating: hasCreationLog(uid),
      })
    }

    // Add stopped workspaces
    for (const cm of savedCms) {
      const uid = cm.metadata?.labels?.['workspace-uid'] ?? ''
      const name = cm.metadata?.labels?.['workspace-name'] ?? ''
      if (uid && name && !runningUids.has(uid)) {
        result.push({ name, uid, running: false, creating: false })
      }
    }

    return result
  },
)

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/login') return

    const session = await checkAuth()
    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  loader: async ({ location }) => {
    if (location.pathname === '/login') return { navWorkspaces: [] }
    const navWorkspaces = await fetchNavWorkspaces()
    return { navWorkspaces }
  },
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'WorkspaceKit' },
      {
        name: 'description',
        content: 'Cloud development workspace management dashboard',
      },
    ],
    links: [{ rel: 'stylesheet', href: globalsCss }],
  }),
})

// ---------------------------------------------------------------------------
// Breadcrumb helper
// ---------------------------------------------------------------------------

function Breadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const crumbs: { label: string; path?: string }[] = [{ label: '192.168.9.202' }]

  if (pathname === '/') {
    crumbs.push({ label: 'Summary' })
  } else if (pathname === '/workspaces') {
    crumbs.push({ label: 'Workspaces' })
  } else if (pathname.startsWith('/workspace/')) {
    crumbs.push({ label: 'Workspaces', path: '/workspaces' })
    crumbs.push({ label: 'Detail' })
  } else if (pathname.startsWith('/monitor/')) {
    crumbs.push({ label: 'Monitor' })
    const sub = pathname.split('/').pop()
    if (sub) crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1) })
  } else if (pathname === '/storage') {
    crumbs.push({ label: 'Storage' })
  } else if (pathname.startsWith('/manage/')) {
    crumbs.push({ label: 'Manage' })
    const sub = pathname.split('/').pop()
    if (sub) crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1) })
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Server className="h-4 w-4 text-header-foreground/60" />
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-header-foreground/40" />}
          <span
            className={
              i === crumbs.length - 1
                ? 'font-medium text-header-foreground'
                : 'text-header-foreground/60'
            }
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isLoginPage = pathname === '/login'
  const { navWorkspaces } = Route.useLoaderData()
  const routeContext = Route.useRouteContext() as
    | { session?: { user: string; role: string } }
    | undefined

  const handleLogout = async () => {
    await fetch('/api/login', {
      method: 'DELETE',
      headers: { 'X-Requested-With': 'workspacekit' },
    })
    window.location.href = '/login'
  }

  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body className="bg-background text-foreground antialiased">
        {isLoginPage ? (
          <Outlet />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Navigator sidebar */}
            <Navigator
              workspaces={navWorkspaces}
              user={routeContext?.session?.user}
              onLogout={handleLogout}
            />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Dark header */}
              <header className="flex h-10 shrink-0 items-center gap-4 border-b border-nav-border bg-[var(--color-header)] px-4">
                <Breadcrumb />
              </header>

              {/* Page content */}
              <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl">
                  <Outlet />
                </div>
              </main>

              {/* Recent Tasks panel */}
              <TasksPanel />
            </div>
          </div>
        )}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
