<div align="center">

# WorkspaceKit

**Self-hosted Kubernetes workspace manager with in-browser VS Code**

[Features](#features) · [Quick Start](#quick-start) · [Configuration](#configuration) · [Architecture](#architecture) · [Comparison](#comparison) · [Contributing](#contributing)

</div>

---

## What is WorkspaceKit?

WorkspaceKit is a self-hosted web dashboard for creating and managing developer workspaces on Kubernetes. Point it at any Git repository and get a full development environment with an in-browser VS Code editor, terminal access, and persistent storage — all running on your own infrastructure.

Think of it as a self-hosted alternative to GitHub Codespaces or Gitpod. You get the same one-click workspace experience without sending your code to a third party, with full control over resource limits, networking, and data retention.

## Features

### Dashboard
- **Host summary** — Live CPU, memory, and disk gauges with sparkline trends, system info, and workspace counts
- **Dark navigator sidebar** — Persistent tree-nav with host, workspaces (with status dots), storage, monitor, and manage sections
- **Recent tasks panel** — Collapsible bottom panel tracking create/start/stop/delete operations in real time

### Workspaces
- **One-click workspaces** — Create a dev environment from any Git repo URL (public or private)
- **Data grid + card views** — Sortable table with status, CPU, memory, owner, repository, branch, and age columns; toggle to card layout
- **Bulk actions** — Start, stop, or delete multiple workspaces with multi-select checkboxes
- **Right-click context menus** — Quick access to actions on any workspace row or card
- **Workspace detail** — Tabbed view with Summary, Monitor, Configure, Logs, and Terminal tabs

### Development Environment
- **devcontainer.json support** — Automatically detects and applies devcontainer features, settings, and extensions
- **In-browser VS Code** — Full OpenVSCode Server editor accessible from any browser
- **Integrated terminal** — xterm.js terminal with real-time streaming via WebSockets
- **Real-time build logs** — Stream container build progress live via SSE
- **Workspace duplication** — Clone an existing workspace with one click

### Infrastructure
- **Resource management** — Set CPU and memory limits per workspace, with LimitRange and ResourceQuota controls
- **Persistent storage** — Each workspace gets a dedicated PVC, surviving restarts; storage overview page
- **Auto-shutdown schedules** — Configure daily start/stop windows per workspace
- **Workspace expiry** — Automatically delete idle workspaces after a configurable period
- **Presets** — Pre-configured workspace templates for common stacks
- **Multi-user authentication** — Credential-based auth with HMAC-signed session cookies
- **Private repo support** — Use a GitHub token to clone private repositories

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR + full-stack TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Runtime | [Bun](https://bun.sh) |
| Monorepo | [Turborepo](https://turbo.build) |
| Language | TypeScript + [Zod](https://zod.dev) validation |
| Terminal | [xterm.js](https://xtermjs.org) |
| Editor | [OpenVSCode Server](https://github.com/gitpod-io/openvscode-server) |
| Testing | [Playwright](https://playwright.dev) (E2E) + [Bun test](https://bun.sh/docs/cli/test) (unit) |

## Architecture

```
workspacekit/
├── apps/
│   ├── web/          # TanStack Start dashboard (SSR frontend + API routes)
│   └── worker/       # Background worker (schedules, expiry, cleanup)
├── packages/
│   ├── k8s/          # Kubernetes client (pods, PVCs, services, configmaps)
│   ├── types/        # Shared TypeScript types and Zod schemas
│   └── ui/           # Reusable UI components (shadcn/ui based)
├── e2e/              # Playwright end-to-end tests
├── k8s/              # Kubernetes manifests for deployment
├── Dockerfile        # Production container image
└── turbo.json        # Turborepo pipeline config
```

## Quick Start

### Deploy to Kubernetes

```bash
# 1. Clone and configure
git clone https://github.com/jellologic/workspacekit.git
cp .env.example .env  # edit with your values

# 2. Build the Docker image
docker build -t workspacekit:latest .

# 3. Deploy to your cluster
kubectl apply -f k8s/
```

### Local Development

```bash
# Install dependencies
bun install

# Start dev server (web + worker)
bun run dev
```

The dashboard will be available at `http://localhost:3000`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_PORT` | `3000` | Port the web server listens on |
| `DASHBOARD_NAMESPACE` | `workspacekit` | Kubernetes namespace for workspaces |
| `DASHBOARD_DEFAULT_IMAGE` | `mcr.microsoft.com/devcontainers/base:ubuntu` | Default container image |
| `DASHBOARD_DISK_SIZE` | `50Gi` | Default PVC size per workspace |
| `OPENVSCODE_PATH` | `/opt/openvscode-server` | Path to OpenVSCode Server in container |
| `DASHBOARD_USER` | — | Admin username |
| `DASHBOARD_PASS` | — | Admin password |
| `DASHBOARD_USERS_FILE` | — | Path to JSON file for multi-user auth |
| `SESSION_SECRET` | — | HMAC secret for session cookies (required in production) |
| `GH_TOKEN` | — | GitHub token for cloning private repositories |

## Comparison

| Feature | WorkspaceKit | GitHub Codespaces | Gitpod | Coder |
|---------|-------------|-------------------|--------|-------|
| Self-hosted | Yes | No | Yes (paid) | Yes |
| Open source | MIT | No | Partial | Yes (AGPL) |
| In-browser IDE | VS Code (OpenVSCode) | VS Code | VS Code | VS Code / JetBrains |
| devcontainer.json | Yes | Yes | Partial | Yes |
| Kubernetes native | Yes | No | Yes | Yes |
| Auto-shutdown | Yes | Yes | Yes | Yes |
| Setup complexity | Low (single container) | N/A (SaaS) | Medium | High |
| Resource limits | Per workspace | Per plan | Per plan | Per template |
| Cost | Free | $0.18+/hr | $0.36+/hr | Free (OSS) |

## UI Overview

The dashboard uses an infrastructure-management inspired design with a dark navigator sidebar, data-grid workspace list, live performance gauges, and a recent tasks panel.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Host summary — live CPU/memory/disk gauges, sparklines, system info |
| `/workspaces` | Workspace list — sortable data grid with card toggle, bulk actions, context menus |
| `/workspace/:uid` | Workspace detail — Summary, Monitor, Configure, Logs, Terminal tabs |
| `/storage` | PVC overview — all workspace persistent volume claims |
| `/monitor/performance` | Live performance charts with process table |
| `/monitor/events` | Aggregated Kubernetes events across all workspace pods |
| `/monitor/tasks` | Full task history log |
| `/manage/defaults` | Workspace creation defaults (CPU/memory) |
| `/manage/schedules` | Auto start/stop schedules |
| `/manage/presets` | Workspace templates |
| `/manage/expiry` | Inactivity expiry settings |
| `/manage/quota` | LimitRange and ResourceQuota configuration |

## Contributing

```bash
# Run unit tests
bun run test

# Run E2E tests (requires a running instance)
bun run test:e2e

# Build all packages
bun run build

# Type check
bun run typecheck
```

## License

[MIT](LICENSE) — built by [jellologic](https://github.com/jellologic).
