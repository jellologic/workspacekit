"""All CSS as string constants."""

COMMON_CSS = """\
/* === Dual Theme Variables === */
html[data-theme="light"], html:not([data-theme]) {
  --bg: #f8f9fa;
  --bg-gradient: radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%);
  --card: rgba(255,255,255,0.72);
  --card-solid: #ffffff;
  --text: #09090b;
  --text-secondary: #3f3f46;
  --muted: #71717a;
  --link: #2563eb;
  --accent: #2563eb;
  --accent-muted: rgba(37,99,235,0.10);
  --border: rgba(0,0,0,0.08);
  --border2: rgba(0,0,0,0.12);
  --border-glass: rgba(0,0,0,0.06);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
  --shadow-glass: 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
  --glass-blur: 16px;
  --glass-saturate: 1.8;
  --input-bg: rgba(0,0,0,0.03);
  --input-border: rgba(0,0,0,0.12);
  --table-header: rgba(0,0,0,0.03);
  --table-hover: rgba(0,0,0,0.02);
  --bar-track: #e4e4e7;
  --code-bg: rgba(0,0,0,0.04);
  --terminal-bg: #1e1e2e;
  --terminal-fg: #cdd6f4;
  --success: #16a34a;
  --success-muted: rgba(22,163,74,0.10);
  --danger: #dc2626;
  --danger-muted: rgba(220,38,38,0.10);
  --warning: #ca8a04;
  --warning-muted: rgba(202,138,4,0.10);
  --info: #2563eb;
  --info-muted: rgba(37,99,235,0.10);
  --chart-green: #16a34a;
  --chart-blue: #2563eb;
  --chart-yellow: #ca8a04;
  --chart-red: #dc2626;
  --bar-seg-used: #16a34a;
  --bar-seg-buffers: #2563eb;
  --bar-seg-cache: #ca8a04;
  --bar-seg-swap: #dc2626;
  --bar-seg-disk: #2563eb;
  --legend-used: #16a34a;
  --legend-buffers: #2563eb;
  --legend-cache: #ca8a04;
  --cond-ok: #16a34a;
  --cond-fail: #dc2626;
  color-scheme: light;
}

html[data-theme="dark"] {
  --bg: #09090b;
  --bg-gradient: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%);
  --card: rgba(24,24,27,0.72);
  --card-solid: #18181b;
  --text: #fafafa;
  --text-secondary: #d4d4d8;
  --muted: #a1a1aa;
  --link: #3b82f6;
  --accent: #3b82f6;
  --accent-muted: rgba(59,130,246,0.15);
  --border: rgba(255,255,255,0.06);
  --border2: rgba(255,255,255,0.10);
  --border-glass: rgba(255,255,255,0.06);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
  --shadow-glass: 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
  --glass-blur: 16px;
  --glass-saturate: 1.8;
  --input-bg: rgba(255,255,255,0.05);
  --input-border: rgba(255,255,255,0.10);
  --table-header: rgba(255,255,255,0.04);
  --table-hover: rgba(255,255,255,0.03);
  --bar-track: #27272a;
  --code-bg: rgba(255,255,255,0.06);
  --terminal-bg: #0d1117;
  --terminal-fg: #e1e4e8;
  --success: #3fb950;
  --success-muted: rgba(63,185,80,0.15);
  --danger: #f85149;
  --danger-muted: rgba(248,81,73,0.15);
  --warning: #d29922;
  --warning-muted: rgba(210,153,34,0.15);
  --info: #3b82f6;
  --info-muted: rgba(59,130,246,0.15);
  --chart-green: #3fb950;
  --chart-blue: #3b82f6;
  --chart-yellow: #d29922;
  --chart-red: #f85149;
  --bar-seg-used: #3fb950;
  --bar-seg-buffers: #1f6feb;
  --bar-seg-cache: #d29922;
  --bar-seg-swap: #f85149;
  --bar-seg-disk: #1f6feb;
  --legend-used: #3fb950;
  --legend-buffers: #1f6feb;
  --legend-cache: #d29922;
  --cond-ok: #3fb950;
  --cond-fail: #f85149;
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  html:not([data-theme]) {
    --bg: #09090b;
    --bg-gradient: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%);
    --card: rgba(24,24,27,0.72);
    --card-solid: #18181b;
    --text: #fafafa;
    --text-secondary: #d4d4d8;
    --muted: #a1a1aa;
    --link: #3b82f6;
    --accent: #3b82f6;
    --accent-muted: rgba(59,130,246,0.15);
    --border: rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.10);
    --border-glass: rgba(255,255,255,0.06);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
    --shadow-glass: 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
    --glass-blur: 16px;
    --glass-saturate: 1.8;
    --input-bg: rgba(255,255,255,0.05);
    --input-border: rgba(255,255,255,0.10);
    --table-header: rgba(255,255,255,0.04);
    --table-hover: rgba(255,255,255,0.03);
    --bar-track: #27272a;
    --code-bg: rgba(255,255,255,0.06);
    --terminal-bg: #0d1117;
    --terminal-fg: #e1e4e8;
    --success: #3fb950;
    --success-muted: rgba(63,185,80,0.15);
    --danger: #f85149;
    --danger-muted: rgba(248,81,73,0.15);
    --warning: #d29922;
    --warning-muted: rgba(210,153,34,0.15);
    --info: #3b82f6;
    --info-muted: rgba(59,130,246,0.15);
    --chart-green: #3fb950;
    --chart-blue: #3b82f6;
    --chart-yellow: #d29922;
    --chart-red: #f85149;
    --bar-seg-used: #3fb950;
    --bar-seg-buffers: #1f6feb;
    --bar-seg-cache: #d29922;
    --bar-seg-swap: #f85149;
    --bar-seg-disk: #1f6feb;
    --legend-used: #3fb950;
    --legend-buffers: #1f6feb;
    --legend-cache: #d29922;
    --cond-ok: #3fb950;
    --cond-fail: #f85149;
    color-scheme: dark;
  }
}

/* === Global Transition for Theme Switch === */
*, *::before, *::after {
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
}

/* === Reset === */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* === Body === */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  background-image: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--text);
  padding: 1.25rem 1.5rem;
  font-size: 14px;
  min-height: 100vh;
}

/* === Typography === */
h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.15rem; }
h2 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--muted); }
.subtitle { color: var(--muted); font-size: 0.8rem; margin-bottom: 1rem; }
.muted { color: var(--muted); }
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }

/* === Glassmorphism === */
.glass {
  background: var(--card);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-glass);
}
.glass-elevated {
  background: var(--card);
  backdrop-filter: blur(24px) saturate(2.0);
  -webkit-backdrop-filter: blur(24px) saturate(2.0);
  border: 1px solid var(--border2);
  box-shadow: var(--shadow-lg);
}

/* === Buttons === */
.btn {
  padding: 0.3rem 0.7rem; border: none; border-radius: 6px; cursor: pointer;
  font-size: 0.78rem; font-weight: 500;
  transition: all 0.15s ease;
}
.btn:hover { filter: brightness(1.05); transform: translateY(-0.5px); }
.btn:active { transform: translateY(0); }
.btn:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; filter: none; }
.btn-red { background: var(--danger); color: #fff; }
.btn-green { background: var(--success); color: #fff; }
.btn-blue { background: var(--accent); color: #fff; padding: 0.45rem 0.9rem; font-size: 0.85rem; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.72rem; }
.btn-ghost {
  background: var(--table-header); color: var(--text-secondary);
  border: 1px solid var(--border2); border-radius: 6px;
}
.btn-ghost:hover { background: var(--table-hover); border-color: var(--muted); }
.btn-outline-red { background: transparent; color: var(--danger); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); }
.btn-outline-red:hover { background: color-mix(in srgb, var(--danger) 8%, transparent); }
.btn-confirm { background: var(--danger); color: #fff; border: 1px solid var(--danger); animation: pulse 0.8s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
.btn-icon {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 0.85rem; padding: 0 0.25rem;
}
.btn-icon:hover { color: var(--link); }

/* === Tables === */
table {
  width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;
  background: var(--card);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
th {
  text-align: left; padding: 0.6rem 0.75rem; background: var(--table-header);
  color: var(--muted); font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.05em; font-weight: 500;
}
td {
  padding: 0.5rem 0.75rem; border-top: 1px solid var(--border);
  font-size: 0.82rem; vertical-align: middle;
}
tr:hover td { background: var(--table-hover); }

/* === Status Colors (inline text) === */
.st-running { color: var(--success); }
.st-stopped { color: var(--danger); }
.st-creating { color: var(--warning); }

/* === Toast === */
.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  background: var(--card);
  backdrop-filter: blur(24px) saturate(2.0);
  -webkit-backdrop-filter: blur(24px) saturate(2.0);
  border: 1px solid var(--border2); border-radius: 8px;
  padding: 0.7rem 1.1rem; font-size: 0.85rem;
  display: none; z-index: 100; box-shadow: var(--shadow-lg);
  animation: toast-in 0.25s ease;
}
@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.toast.ok { border-color: var(--success); }
.toast.err { border-color: var(--danger); }

/* === Inputs (global) === */
input, select {
  background: var(--input-bg); border: 1px solid var(--input-border);
  border-radius: 6px; color: var(--text); padding: 0.3rem 0.5rem;
  font-size: 0.8rem; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-muted);
}

/* === Bar Utilities === */
.bar-danger { background: var(--danger) !important; }
.bar-warning { background: var(--warning) !important; }
.bar-success { background: var(--success) !important; }
.bar-seg-used { background: var(--bar-seg-used); }
.bar-seg-buffers { background: var(--bar-seg-buffers); }
.bar-seg-cache { background: var(--bar-seg-cache); }
.bar-seg-swap { background: var(--bar-seg-swap); }
.bar-seg-disk { background: var(--bar-seg-disk); }
.legend-used { color: var(--legend-used); }
.legend-buffers { color: var(--legend-buffers); }
.legend-cache { color: var(--legend-cache); }

/* === Condition dot utilities === */
.cond-ok { color: var(--cond-ok); }
.cond-fail { color: var(--cond-fail); }

/* === Theme Toggle Button === */
.theme-toggle {
  position: fixed; top: 0.75rem; right: 0.75rem; z-index: 200;
  width: 36px; height: 36px; border-radius: 18px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--card);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-glass);
  color: var(--muted);
  transition: all 0.2s ease;
}
.theme-toggle:hover { color: var(--text); box-shadow: var(--shadow-md); }
.theme-toggle svg { width: 18px; height: 18px; }
.theme-toggle .icon-sun { display: none; }
.theme-toggle .icon-moon { display: block; }
html[data-theme="dark"] .theme-toggle .icon-sun { display: block; }
html[data-theme="dark"] .theme-toggle .icon-moon { display: none; }
"""

MAIN_PAGE_CSS = """\
/* === System Overview === */
.sys { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.sys-card {
  background: var(--card); border-radius: 8px; padding: 0.75rem 1rem;
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.sys-card:hover { box-shadow: var(--shadow-md); border-color: var(--border2); }
.sys-card h3 {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--muted); margin-bottom: 0.5rem; font-weight: 500;
}

/* CPU Grid */
.cpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 2px; }
.core { display: flex; align-items: center; gap: 3px; font-size: 0.65rem; color: var(--muted); }
.core-id { width: 20px; text-align: right; flex-shrink: 0; }
.core-bar { flex: 1; height: 8px; background: var(--bar-track); border-radius: 2px; overflow: hidden; }
.core-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.core-fill.bar-danger { background: var(--danger); }
.core-fill.bar-warning { background: var(--warning); }
.core-fill.bar-success { background: var(--success); }
.core-fill.bar-success-dim { background: color-mix(in srgb, var(--success) 70%, var(--bar-track)); }

.cpu-overall { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
.cpu-overall span { font-size: 0.8rem; color: var(--muted); font-weight: 400; }

/* Metrics */
.metric { margin-bottom: 0.5rem; }
.metric-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px; }
.metric-label span:first-child { color: var(--muted); }
.bar { height: 14px; background: var(--bar-track); border-radius: 3px; overflow: hidden; display: flex; }
.bar-seg { height: 100%; transition: width 0.3s; }

/* Chips */
.chips { display: flex; gap: 1rem; flex-wrap: wrap; }
.chip {
  background: var(--card); border-radius: 6px; padding: 0.4rem 0.75rem;
  font-size: 0.8rem; border: 1px solid var(--border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
.chip .val { font-weight: 600; }
.chip .lbl { color: var(--muted); font-size: 0.7rem; }

/* Legend */
.mem-legend { font-size: 0.65rem; color: var(--muted); margin-top: 2px; }

/* === Settings Panel === */
.settings-toggle {
  cursor: pointer; color: var(--link); font-size: 0.82rem; font-weight: 500;
  display: inline-block; margin-bottom: 0.5rem;
}
.settings-panel {
  display: none; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;
  background: var(--card);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-sm);
}
.settings-panel.open { display: block; }
.settings-row { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; }
.settings-row label { color: var(--muted); font-size: 0.75rem; min-width: 100px; }
.settings-row input { width: 80px; }
.settings-row .sep { color: var(--muted); font-size: 0.75rem; }
.settings-group { margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
.settings-group:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.settings-group h4 {
  font-size: 0.75rem; color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.04em; margin-bottom: 0.4rem;
}
.settings-used { font-size: 0.72rem; color: var(--muted); margin-left: 0.5rem; }

/* === Create Bar === */
.create-bar { display: flex; gap: 0.5rem; margin: 1rem 0; align-items: center; }
.create-bar input {
  background: var(--input-bg); border: 1px solid var(--input-border);
  border-radius: 6px; color: var(--text); padding: 0.45rem 0.7rem;
  font-size: 0.85rem; outline: none;
}
.create-bar input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-muted); }
.create-bar input.repo { flex: 1; min-width: 200px; }
.create-bar input.ws-name { width: 170px; }

/* Misc */
.timer-display { font-size: 0.78rem; color: var(--muted); margin-right: 0.4rem; }
.timer-select {
  background: var(--input-bg); color: var(--text); border: 1px solid var(--input-border);
  border-radius: 4px; padding: 0.15rem 0.25rem; font-size: 0.72rem; cursor: pointer;
}
.res-display { font-size: 0.78rem; font-family: 'SF Mono', Menlo, monospace; }
.repo-link {
  font-size: 0.75rem; max-width: 200px; display: inline-block; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
}

/* === Resize Popup === */
.resize-popup {
  display: none; position: absolute; border-radius: 8px; padding: 0.75rem; z-index: 50;
  background: var(--card);
  backdrop-filter: blur(24px) saturate(2.0);
  -webkit-backdrop-filter: blur(24px) saturate(2.0);
  border: 1px solid var(--border2);
  box-shadow: var(--shadow-lg);
}
.resize-popup.open { display: block; }
.resize-popup label { font-size: 0.7rem; color: var(--muted); display: block; margin-bottom: 2px; }
.resize-popup input { width: 70px; margin-bottom: 0.4rem; }
.resize-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem 0.75rem; margin-bottom: 0.5rem; }

/* Processes Table */
.proc-table { font-size: 0.78rem; }
.proc-table th { font-size: 0.65rem; padding: 0.4rem 0.6rem; }
.proc-table td { padding: 0.3rem 0.6rem; font-family: 'SF Mono', Menlo, monospace; font-size: 0.72rem; }
.proc-table .num { text-align: right; }
.proc-table .cmd { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Workspace Links */
.ws-name-link { color: var(--link); text-decoration: none; font-weight: 600; }
.ws-name-link:hover { text-decoration: underline; }

/* Usage Display */
.usage-display { font-size: 0.78rem; font-family: 'SF Mono', Menlo, monospace; }
.usage-cpu { color: var(--chart-yellow); }
.usage-mem { color: var(--chart-blue); }

/* === Bulk Action Bar === */
.bulk-bar {
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  border-radius: 10px; padding: 0.5rem 1.2rem; display: none;
  align-items: center; gap: 0.75rem; z-index: 90;
  background: var(--card);
  backdrop-filter: blur(24px) saturate(2.0);
  -webkit-backdrop-filter: blur(24px) saturate(2.0);
  border: 1px solid var(--border2);
  box-shadow: var(--shadow-lg);
}
.bulk-bar.visible { display: flex; }
.bulk-bar .bulk-count { font-size: 0.82rem; color: var(--text); font-weight: 500; margin-right: 0.25rem; }
.ws-check, #select-all { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }

/* === Presets === */
.presets-section { margin: 1rem 0; }
.presets-toggle {
  cursor: pointer; color: var(--link); font-size: 0.82rem; font-weight: 500;
  display: inline-block; margin-bottom: 0.5rem;
}
.presets-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.preset-card {
  background: var(--card); border: 1px solid var(--border2); border-radius: 8px;
  padding: 0.6rem 0.9rem; cursor: pointer; min-width: 180px; max-width: 260px;
  position: relative;
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.preset-card:hover { border-color: var(--link); box-shadow: var(--shadow-md); }
.preset-card .preset-name { font-weight: 600; font-size: 0.82rem; margin-bottom: 2px; }
.preset-card .preset-desc { font-size: 0.72rem; color: var(--muted); margin-bottom: 4px; }
.preset-card .preset-meta { font-size: 0.68rem; color: var(--muted); font-family: 'SF Mono', Menlo, monospace; }
.preset-card .preset-del {
  position: absolute; top: 4px; right: 6px; background: none; border: none;
  color: var(--danger); cursor: pointer; font-size: 0.72rem; opacity: 0.5;
}
.preset-card .preset-del:hover { opacity: 1; }

.save-preset-form {
  background: var(--card); border: 1px solid var(--border2); border-radius: 8px;
  padding: 0.75rem 1rem; margin-bottom: 0.75rem; display: none;
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
.save-preset-form.open { display: block; }
.save-preset-form .form-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; }
.save-preset-form label { color: var(--muted); font-size: 0.72rem; min-width: 80px; }
.save-preset-form input { width: 180px; }

/* === Git Status === */
.git-branch {
  font-family: 'SF Mono', Menlo, monospace; font-size: 0.72rem; color: var(--muted);
  margin-left: 0.3rem;
}
.git-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  margin-right: 3px; vertical-align: middle;
}
.git-dot.clean { background: var(--success); }
.git-dot.dirty { background: var(--warning); }

/* Expiry */
.expiry-icon { font-size: 0.72rem; margin-left: 3px; }
"""

DETAIL_PAGE_CSS = """\
/* === Breadcrumb === */
.breadcrumb { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.75rem; }
.breadcrumb a { color: var(--link); }

/* === Detail Header === */
.detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.detail-header h1 { margin-bottom: 0; }

/* Status Badges (muted bg + colored text) */
.status-badge {
  display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px;
  font-size: 0.75rem; font-weight: 500;
}
.status-badge.running {
  background: var(--success-muted); color: var(--success);
  border: 1px solid color-mix(in srgb, var(--success) 20%, transparent);
}
.status-badge.stopped {
  background: var(--danger-muted); color: var(--danger);
  border: 1px solid color-mix(in srgb, var(--danger) 20%, transparent);
}
.status-badge.creating {
  background: var(--warning-muted); color: var(--warning);
  border: 1px solid color-mix(in srgb, var(--warning) 20%, transparent);
}
.detail-actions { display: flex; gap: 0.5rem; margin-left: auto; }

/* === Cards === */
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.card {
  background: var(--card); border-radius: 8px; padding: 0.75rem 1rem;
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.card:hover { box-shadow: var(--shadow-md); border-color: var(--border2); }
.card h3 {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--muted); margin-bottom: 0.5rem; font-weight: 500;
}
.card-full { grid-column: 1 / -1; }

/* Key-Value Pairs */
.kv { display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 1rem; font-size: 0.82rem; }
.kv dt { color: var(--muted); font-size: 0.75rem; }
.kv dd { font-family: 'SF Mono', Menlo, monospace; font-size: 0.8rem; }

/* === Log Viewer === */
.log-viewer {
  background: var(--code-bg); border: 1px solid var(--border2); border-radius: 6px;
  padding: 0.75rem; font-family: 'SF Mono', Menlo, monospace; font-size: 0.72rem;
  max-height: 500px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
  color: var(--text-secondary); line-height: 1.5;
}
.log-controls { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; }
.log-status { font-size: 0.75rem; color: var(--muted); }

/* === Events Table === */
.event-table { font-size: 0.78rem; }
.event-table th { font-size: 0.65rem; padding: 0.4rem 0.6rem; }
.event-table td { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
.event-type-warning { color: var(--warning); }
.event-type-normal { color: var(--success); }

/* === Schedules === */
.schedule-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.schedule-row .sched-label { font-size: 0.78rem; font-weight: 500; min-width: 70px; }
.day-checks { display: flex; gap: 0.3rem; }
.day-checks label {
  font-size: 0.68rem; color: var(--muted); display: flex; align-items: center;
  gap: 2px; cursor: pointer;
}
.day-checks input { width: 13px; height: 13px; accent-color: var(--accent); }
input[type="time"] { padding: 0.2rem 0.4rem; font-size: 0.78rem; }

/* === Terminal === */
#terminal-container { background: var(--terminal-bg); border-radius: 6px; overflow: hidden; margin-top: 0.5rem; }
#terminal-container .xterm { padding: 4px; }
.term-controls { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
.term-status { font-size: 0.75rem; color: var(--muted); }

/* === Git Status Card === */
.git-status-badge {
  display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px;
  font-size: 0.72rem; font-weight: 500;
}
.git-status-badge.clean {
  background: var(--success-muted); color: var(--success);
  border: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
}
.git-status-badge.dirty {
  background: var(--warning-muted); color: var(--warning);
  border: 1px solid color-mix(in srgb, var(--warning) 25%, transparent);
}

/* === PVC Usage Bar === */
.pvc-bar {
  height: 10px; background: var(--bar-track); border-radius: 3px; overflow: hidden;
  display: inline-flex; min-width: 80px; max-width: 120px; vertical-align: middle;
}
.pvc-bar .bar-seg { height: 100%; }

/* === Sparklines === */
.sparkline-card { padding: 0.75rem 1rem; }
.sparkline-row { display: flex; gap: 2rem; flex-wrap: wrap; }
.sparkline-item { flex: 1; min-width: 200px; }
.sparkline-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 0.25rem;
}
.sparkline-label {
  font-size: 0.72rem; color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.04em; font-weight: 500;
}
.sparkline-value { font-size: 0.82rem; font-weight: 600; font-family: 'SF Mono', Menlo, monospace; }
.sparkline-chart { width: 100%; }
.sparkline-chart svg { width: 100%; display: block; }
.sparkline-range {
  display: flex; justify-content: space-between; font-size: 0.65rem;
  color: var(--muted); margin-top: 2px;
}

/* === Expiry Warning === */
.expiry-warning {
  background: var(--warning-muted);
  border: 1px solid color-mix(in srgb, var(--warning) 25%, transparent);
  border-radius: 8px; padding: 0.6rem 1rem; margin-bottom: 1rem;
  color: var(--warning); font-size: 0.82rem;
}
"""
