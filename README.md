# DevPod Dashboard

A self-hosted web dashboard for managing [DevPod](https://devpod.sh) workspaces on Kubernetes. Monitor your server, manage workspaces, stream live logs -- all from a single pane of glass. Pure Python stdlib, zero dependencies.

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue)](https://python.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)]()

## Why Use This Instead of the DevPod Desktop App?

DevPod ships with a polished desktop client -- but if you're running a **shared Kubernetes cluster** with multiple developers or self-hosting DevPod on a dedicated server, the desktop app has gaps:

| | DevPod Desktop | DevPod Dashboard |
|---|---|---|
| **Server monitoring** | No visibility into host resources | Live CPU (per-core), memory, swap, disk, load, top processes |
| **Multi-user visibility** | Each user only sees their own workspaces | Single view of all workspaces across the cluster |
| **Resource management** | Set at create time only | Resize running workspaces, configure LimitRange and ResourceQuota from the UI |
| **Live logs** | Terminal output during creation | SSE-streamed container logs + creation output in the browser |
| **Workspace detail** | Basic status | Pod info, conditions, events, PVCs, containers, actual CPU/memory usage |
| **Stop/start** | Not supported for Kubernetes provider | Stop workspaces (saves spec to ConfigMap), restart later with preserved config |
| **Duplication** | Not supported | Clone a workspace including PVC data |
| **Auto-shutdown** | Requires CLI flags | Set timers from the UI per workspace |
| **Deployment** | Electron app per developer machine | Single Python process on your server, accessible from any browser |
| **Dependencies** | Node.js + Electron + Go | Python 3.8+ stdlib only. No pip, no node, no containers |

**TL;DR** -- If you administer a DevPod Kubernetes cluster and want server-level visibility, multi-user management, and browser-based access with zero install, this is for you.

## Features

- **Workspace lifecycle** -- create, stop, start, delete, duplicate, and resize workspaces from the browser
- **Live server monitoring** -- per-core CPU usage, memory/swap/disk bars, load averages, top 30 processes
- **Per-workspace detail pages** -- pod spec, containers, k8s events, PVC status, actual CPU/memory usage via `kubectl top`
- **Real-time log streaming** -- SSE-based live `kubectl logs --follow` in the browser, plus creation log capture during `devpod up`
- **Resource controls** -- configure DevPod provider defaults, per-container LimitRange, and namespace ResourceQuota from a settings panel
- **Auto-shutdown timers** -- set 1h/2h/4h/8h/12h/24h idle timers per workspace
- **Zero dependencies** -- pure Python 3.8+ stdlib. No pip install, no Docker, no npm. One `rsync` to deploy

## Quick Start

```bash
git clone https://github.com/jellologic/devpod-dashboard.git
cd devpod-dashboard

cp .env.example .env
# Edit .env -- at minimum, set DASHBOARD_PASS

python3 -m dashboard
```

Open `http://your-host:8080` (default login: `admin` / `changeme`).

## Configuration

All settings via environment variables. See [`.env.example`](.env.example).

| Variable | Default | Description |
|---|---|---|
| `DASHBOARD_USER` | `admin` | HTTP Basic Auth username |
| `DASHBOARD_PASS` | `changeme` | HTTP Basic Auth password |
| `DASHBOARD_PORT` | `8080` | Listen port |
| `KUBECONFIG` | `/etc/rancher/k3s/k3s.yaml` | Path to kubeconfig |
| `DASHBOARD_NAMESPACE` | `devpod` | Kubernetes namespace |
| `DEVPOD_USER` | `devpod` | OS user that runs the devpod CLI |
| `DEVPOD_HOME` | `/home/devpod` | Home directory for the devpod user |

## Deployment

### Systemd (recommended)

Copy the dashboard to your server and run as a systemd service:

```bash
rsync -avz --delete --exclude='.git' --exclude='.env' \
  dashboard/ user@server:/usr/local/lib/dashboard/
```

```ini
# /etc/systemd/system/devpod-dashboard.service
[Unit]
Description=DevPod Dashboard
After=k3s.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 -m dashboard
WorkingDirectory=/usr/local/lib
EnvironmentFile=/usr/local/lib/dashboard/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now devpod-dashboard
```

### Prerequisites

Your server needs:

- **Python 3.8+** (ships with most Linux distros)
- **kubectl** with access to the cluster (e.g. k3s ships with it at `/usr/local/bin/kubectl`)
- **DevPod** installed with the Kubernetes provider configured
- **sudo** access for the dashboard to run `devpod` CLI commands as the devpod user

## Architecture

```
dashboard/
    __main__.py              # Entry point
    config.py                # All configuration (env vars)
    auth.py                  # HTTP Basic Auth
    server.py                # Route dispatch (GET /, /workspace/<name>, SSE logs, POST /api/*)
    kube.py                  # kubectl wrappers
    stats.py                 # /proc-based system stats collector (2s interval)
    settings.py              # LimitRange / ResourceQuota / provider defaults
    workspaces.py            # Workspace CRUD + detail gathering
    logs.py                  # Ring buffer for creation logs + SSE stream generator
    templates/
        base.py              # HTML document shell
        styles.py            # CSS (dark theme)
        scripts.py           # Client-side JavaScript
        main_page.py         # Main dashboard renderer
        workspace_detail.py  # Detail page renderer
```

**Design decisions:**
- **No framework** -- just `http.server` from the stdlib. One less thing to break, upgrade, or CVE-patch
- **No frontend build** -- HTML/CSS/JS are Python string templates. No webpack, no npm, no node_modules
- **No database** -- workspace state lives in Kubernetes (pods, ConfigMaps, PVCs). The dashboard is stateless
- **Server-side rendering** -- every page load gets fresh data from `kubectl`. Auto-refreshes every 10-15s

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Main dashboard |
| `GET` | `/workspace/<name>` | Workspace detail page |
| `GET` | `/api/logs/stream/<pod>` | SSE live log stream |
| `GET` | `/api/logs/creation/<name>` | Creation log JSON |
| `POST` | `/api/create` | Create workspace |
| `POST` | `/api/stop` | Stop workspace |
| `POST` | `/api/start` | Start workspace |
| `POST` | `/api/delete` | Delete workspace |
| `POST` | `/api/duplicate` | Duplicate workspace |
| `POST` | `/api/resize` | Resize workspace resources |
| `POST` | `/api/timer` | Set auto-shutdown timer |
| `POST` | `/api/settings/provider` | Update provider defaults |
| `POST` | `/api/settings/limitrange` | Update LimitRange |
| `POST` | `/api/settings/quota` | Update ResourceQuota |

## Contributing

Issues and PRs welcome. This project intentionally has zero dependencies -- please keep it that way.

## License

[MIT](LICENSE)
