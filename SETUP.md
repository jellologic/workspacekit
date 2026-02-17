# DevPod Dashboard -- Complete Setup Guide

Step-by-step instructions for setting up DevPod Dashboard on a fresh Linux server. This guide assumes you're starting from a clean Ubuntu/Debian server and covers everything from Kubernetes to a running dashboard.

If you already have DevPod + Kubernetes running, skip to [Step 4: Install the Dashboard](#step-4-install-the-dashboard).

---

## Table of Contents

1. [Prerequisites](#step-1-prerequisites)
2. [Install Kubernetes (k3s)](#step-2-install-kubernetes-k3s)
3. [Install DevPod with Kubernetes Provider](#step-3-install-devpod-with-kubernetes-provider)
4. [Install the Dashboard](#step-4-install-the-dashboard)
5. [Configure](#step-5-configure)
6. [Run as a Systemd Service](#step-6-run-as-a-systemd-service)
7. [Verify Everything Works](#step-7-verify-everything-works)
8. [Optional: Resource Limits](#step-8-optional-resource-limits)
9. [Optional: NodePort Service Controller](#step-9-optional-nodeport-service-controller)
10. [Updating](#updating)
11. [Troubleshooting](#troubleshooting)

---

## Step 1: Prerequisites

**Server requirements:**

- Linux (Ubuntu 22.04+, Debian 12+, or similar). Must have `/proc` filesystem (all standard Linux distros do)
- Python 3.8+ (pre-installed on most distros)
- 2+ CPU cores, 4GB+ RAM recommended (more for running multiple workspaces)
- Root or sudo access

**Verify Python is available:**

```bash
python3 --version
# Should print Python 3.8 or higher
```

If not installed:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y python3

# RHEL/Fedora
sudo dnf install -y python3
```

---

## Step 2: Install Kubernetes (k3s)

The dashboard works with any Kubernetes cluster, but [k3s](https://k3s.io) is the simplest single-node option.

```bash
curl -sfL https://get.k3s.io | sh -
```

Verify it's running:

```bash
sudo kubectl get nodes
# Should show your node as Ready
```

k3s places its kubeconfig at `/etc/rancher/k3s/k3s.yaml` (the dashboard default). If you're using a different Kubernetes distribution, note the path to your kubeconfig -- you'll set it in Step 5.

**Create the devpod namespace:**

```bash
sudo kubectl create namespace devpod
```

---

## Step 3: Install DevPod with Kubernetes Provider

### 3a. Create a system user for DevPod

The dashboard runs DevPod CLI commands via `sudo -u devpod`. Create a dedicated user:

```bash
sudo useradd -m -s /bin/bash devpod
```

### 3b. Install the DevPod CLI

```bash
# Download latest DevPod binary
curl -L -o /tmp/devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64"
sudo install /tmp/devpod /usr/local/bin/devpod
rm /tmp/devpod

# Verify
devpod version
```

### 3c. Configure the Kubernetes provider

Run these as the devpod user:

```bash
# Add the Kubernetes provider
sudo -u devpod devpod provider add kubernetes

# Set it as default
sudo -u devpod devpod provider use kubernetes
```

### 3d. Set up kubeconfig for the devpod user

The devpod user needs kubectl access to the cluster:

```bash
sudo mkdir -p /home/devpod/.kube

# For k3s -- copy and adjust the kubeconfig:
sudo cp /etc/rancher/k3s/k3s.yaml /home/devpod/.kube/config
sudo chown -R devpod:devpod /home/devpod/.kube
sudo chmod 600 /home/devpod/.kube/config
```

Verify the devpod user can access the cluster:

```bash
sudo -u devpod kubectl get nodes
# Should show your node
```

### 3e. Configure sudoers

The dashboard process needs to run `devpod` commands as the devpod user. Add a sudoers rule so the dashboard can do this without a password:

```bash
cat <<'EOF' | sudo tee /etc/sudoers.d/devpod-dashboard
# Allow the dashboard to run devpod commands as the devpod user
# Adjust the first username if the dashboard runs as a different OS user
ALL ALL=(devpod) NOPASSWD: /usr/local/bin/devpod
EOF
sudo chmod 440 /etc/sudoers.d/devpod-dashboard
```

> **Note:** If your dashboard runs as root (e.g. directly via systemd), the sudoers rule above covers it. If it runs as a specific user, replace the first `ALL` with that username.

### 3f. (Optional) Configure git credentials for private repos

If your workspaces use private GitHub repos:

```bash
sudo -u devpod git config --global credential.helper store

# Add your token (replace with your actual GitHub PAT)
echo "https://your-username:ghp_YOUR_TOKEN_HERE@github.com" | sudo -u devpod tee /home/devpod/.git-credentials > /dev/null
sudo chmod 600 /home/devpod/.git-credentials
```

---

## Step 4: Install the Dashboard

```bash
# Clone the repository
git clone https://github.com/jellologic/devpod-dashboard.git /tmp/devpod-dashboard

# Copy to the install location
sudo mkdir -p /usr/local/lib/dashboard
sudo cp -r /tmp/devpod-dashboard/* /usr/local/lib/dashboard/
sudo cp /tmp/devpod-dashboard/.env.example /usr/local/lib/dashboard/.env
rm -rf /tmp/devpod-dashboard
```

---

## Step 5: Configure

Edit the environment file:

```bash
sudo nano /usr/local/lib/dashboard/.env
```

**Minimum required change -- set a real password:**

```bash
DASHBOARD_PASS=your-secure-password-here
```

**Full configuration reference:**

```bash
# HTTP Basic Auth
DASHBOARD_USER=admin
DASHBOARD_PASS=your-secure-password-here

# Listen port (default 8080)
DASHBOARD_PORT=8080

# Kubernetes config
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
DASHBOARD_NAMESPACE=devpod

# DevPod system user
DEVPOD_USER=devpod
DEVPOD_HOME=/home/devpod
```

**Adapt for your environment:**

| Your setup | What to change |
|---|---|
| Standard k3s on a single node | Defaults work as-is |
| Different k8s distro (RKE2, kubeadm, EKS, etc.) | Set `KUBECONFIG` to your kubeconfig path |
| DevPod namespace is not "devpod" | Set `DASHBOARD_NAMESPACE` |
| DevPod runs as a different OS user | Set `DEVPOD_USER` and `DEVPOD_HOME` |
| Want a different port | Set `DASHBOARD_PORT` |

---

## Step 6: Run as a Systemd Service

Create the service file:

```bash
cat <<'EOF' | sudo tee /etc/systemd/system/devpod-dashboard.service
[Unit]
Description=DevPod Dashboard
After=network.target k3s.service
Wants=k3s.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 -m dashboard
WorkingDirectory=/usr/local/lib
EnvironmentFile=/usr/local/lib/dashboard/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

> **Note:** If you're not using k3s, change `k3s.service` to your Kubernetes service name (e.g. `kubelet.service`), or remove the `After=` and `Wants=` lines.

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable devpod-dashboard
sudo systemctl start devpod-dashboard
```

Check status:

```bash
sudo systemctl status devpod-dashboard
```

You should see `active (running)`. If not, check the logs:

```bash
sudo journalctl -u devpod-dashboard -f
```

---

## Step 7: Verify Everything Works

### 7a. Dashboard loads

```bash
curl -u admin:your-secure-password-here http://localhost:8080/
# Should return HTML
```

Or open `http://your-server-ip:8080` in a browser.

### 7b. Create a test workspace

From the dashboard UI, enter a public repo URL (e.g. `https://github.com/microsoft/vscode-remote-try-python`) and click "Create Workspace".

Or via curl:

```bash
curl -u admin:your-secure-password-here \
  -X POST http://localhost:8080/api/create \
  -H 'Content-Type: application/json' \
  -d '{"repo": "https://github.com/microsoft/vscode-remote-try-python"}'
```

### 7c. Check creation logs

```bash
curl -s -u admin:your-secure-password-here \
  http://localhost:8080/api/logs/creation/vscode-remote-try-python | python3 -m json.tool
```

### 7d. Verify the workspace detail page

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -u admin:your-secure-password-here \
  http://localhost:8080/workspace/vscode-remote-try-python
# Should print 200
```

---

## Step 8: Optional Resource Limits

Set default resource requests/limits for new workspaces. You can do this from the Settings panel in the dashboard UI, or via kubectl:

**LimitRange (per-container max):**

```bash
cat <<'EOF' | sudo kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: devpod-limits
  namespace: devpod
spec:
  limits:
  - type: Container
    default:
      cpu: "8"
      memory: 32Gi
    defaultRequest:
      cpu: "2"
      memory: 4Gi
    max:
      cpu: "24"
      memory: 64Gi
EOF
```

**ResourceQuota (namespace-wide):**

```bash
cat <<'EOF' | sudo kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: devpod-quota
  namespace: devpod
spec:
  hard:
    requests.cpu: "72"
    requests.memory: 192Gi
    pods: "20"
EOF
```

---

## Step 9: Optional NodePort Service Controller

The dashboard reads NodePort services labeled `managed-by=devpod-nodeport-controller` to show clickable URLs for each workspace. If you want browser-based VS Code access, you need a controller that creates NodePort services for DevPod workspace pods.

This is a simple controller that watches for DevPod pods and creates a NodePort service exposing port 13338 (OpenVSCode Server):

```bash
cat <<'SCRIPT' | sudo tee /usr/local/bin/devpod-nodeport-controller.sh
#!/bin/bash
# Watch for DevPod pods and create NodePort services for OpenVSCode access
NAMESPACE=devpod
KUBECONFIG=/etc/rancher/k3s/k3s.yaml

while true; do
  for uid in $(kubectl --kubeconfig=$KUBECONFIG -n $NAMESPACE get pods -l devpod.sh/created=true \
    -o jsonpath='{.items[*].metadata.labels.devpod\.sh/workspace-uid}' 2>/dev/null); do
    svc_name="vscode-${uid}"
    if ! kubectl --kubeconfig=$KUBECONFIG -n $NAMESPACE get svc "$svc_name" &>/dev/null; then
      kubectl --kubeconfig=$KUBECONFIG -n $NAMESPACE create service nodeport "$svc_name" \
        --tcp=13338:13338 --node-port=0 \
        --dry-run=client -o yaml | \
      kubectl --kubeconfig=$KUBECONFIG -n $NAMESPACE apply -f - \
        --selector="devpod.sh/workspace-uid=$uid" \
        --overwrite=true 2>/dev/null
      # Patch with correct selector and label
      kubectl --kubeconfig=$KUBECONFIG -n $NAMESPACE patch svc "$svc_name" --type=json \
        -p "[{\"op\":\"replace\",\"path\":\"/spec/selector\",\"value\":{\"devpod.sh/workspace-uid\":\"$uid\"}},
             {\"op\":\"add\",\"path\":\"/metadata/labels/managed-by\",\"value\":\"devpod-nodeport-controller\"}]" 2>/dev/null
    fi
  done
  sleep 10
done
SCRIPT
sudo chmod +x /usr/local/bin/devpod-nodeport-controller.sh
```

Run it as a systemd service:

```bash
cat <<'EOF' | sudo tee /etc/systemd/system/devpod-nodeport-controller.service
[Unit]
Description=DevPod NodePort Controller
After=k3s.service

[Service]
Type=simple
ExecStart=/usr/local/bin/devpod-nodeport-controller.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now devpod-nodeport-controller
```

---

## Updating

To update to the latest version:

```bash
cd /tmp
git clone https://github.com/jellologic/devpod-dashboard.git
sudo rsync -a --exclude='.git' --exclude='.env' /tmp/devpod-dashboard/ /usr/local/lib/dashboard/
rm -rf /tmp/devpod-dashboard
sudo systemctl restart devpod-dashboard
```

Your `.env` file is preserved across updates.

---

## Troubleshooting

### Dashboard won't start

```bash
# Check the service logs
sudo journalctl -u devpod-dashboard -n 50

# Test running manually
cd /usr/local/lib
sudo python3 -m dashboard
```

### "Unauthorized" when accessing the dashboard

Check your credentials match what's in `/usr/local/lib/dashboard/.env`:

```bash
sudo grep DASHBOARD_PASS /usr/local/lib/dashboard/.env
```

### Workspace creation fails

**"clone repository: exit status 128"** -- Git can't access the repo. For private repos, set up credentials (Step 3f).

**"No resources available"** -- Namespace quota is full. Check usage in the Settings panel or:

```bash
sudo kubectl -n devpod describe resourcequota devpod-quota
```

### kubectl commands fail

Verify the kubeconfig path is correct and readable:

```bash
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml get nodes
```

If using a non-k3s cluster, make sure `KUBECONFIG` in `.env` points to the right file and has read permissions.

### System stats show as empty

The dashboard reads `/proc/stat`, `/proc/meminfo`, etc. This only works on Linux. If you see no CPU/memory data:

```bash
cat /proc/stat | head -1
# Should show: cpu <numbers>
```

### Workspace URLs don't appear

URLs require the NodePort service controller (Step 9). Without it, workspaces still work -- you just won't see clickable links.

### Dashboard works but workspace actions fail

Check that the sudoers rule is in place:

```bash
sudo cat /etc/sudoers.d/devpod-dashboard
```

And that the devpod user can run commands:

```bash
sudo -u devpod devpod list
sudo -u devpod kubectl -n devpod get pods
```

---

## Architecture Notes for Developers

The dashboard is a single Python process with no external dependencies:

- **HTTP server**: `http.server.ThreadingHTTPServer` from stdlib
- **Routing**: Simple path matching in `server.py` -- no framework
- **Templates**: Python f-strings generating HTML. No template engine
- **State**: Zero local state. All workspace data is read from Kubernetes on every request
- **Stats**: Background thread reads `/proc` every 2 seconds
- **Logs**: `LogBuffer` (ring buffer) captures creation output; SSE streams live `kubectl logs`
- **Auth**: HTTP Basic Auth checked on every request

The dashboard needs to run on the same machine as (or have network access to) the Kubernetes API and the DevPod CLI.
