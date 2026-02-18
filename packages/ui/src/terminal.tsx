import { useEffect, useRef, useState } from 'react'
import { theme } from './theme'

// xterm.js imports -- these resolve at runtime from the dependencies declared
// in package.json.  Type-only fallbacks keep the compiler happy even when the
// packages are not installed in the current workspace.
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export interface TerminalProps {
  /** Kubernetes pod name (displayed in the header). */
  podName: string
  /** Full WebSocket URL, e.g. ws://host:3000/api/terminal/pod-name */
  wsUrl: string
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Terminal: React.FC<TerminalProps> = ({ podName, wsUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const [connState, setConnState] = useState<ConnectionState>('connecting')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ---- xterm setup ----
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      theme: {
        background: theme.colors.codeBg,
        foreground: theme.colors.text,
        cursor: theme.colors.primary,
        selectionBackground: `${theme.colors.primary}40`,
        black: '#484f58',
        red: theme.colors.danger,
        green: theme.colors.success,
        yellow: theme.colors.warning,
        blue: theme.colors.primary,
        magenta: '#bc8cff',
        cyan: '#76e3ea',
        white: theme.colors.text,
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#b3f0ff',
        brightWhite: '#f0f6fc',
      },
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(container)

    // Small delay so the container dimensions are settled before fitting.
    requestAnimationFrame(() => {
      try {
        fit.fit()
      } catch {
        // Container might not be visible yet; ignore.
      }
    })

    termRef.current = term
    fitRef.current = fit

    // ---- WebSocket setup ----
    setConnState('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.binaryType = 'arraybuffer'

    ws.addEventListener('open', () => {
      setConnState('connected')
      term.focus()

      // Send initial terminal dimensions so the server can set pty size.
      const dimensions = { type: 'resize', cols: term.cols, rows: term.rows }
      ws.send(JSON.stringify(dimensions))
    })

    ws.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        term.write(event.data)
      } else if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data))
      }
    })

    ws.addEventListener('close', () => {
      setConnState('disconnected')
      term.write('\r\n\x1b[90m--- connection closed ---\x1b[0m\r\n')
    })

    ws.addEventListener('error', () => {
      setConnState('disconnected')
    })

    // Pipe user input to the WebSocket.
    const dataDisposable = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })

    // Handle terminal resize -- notify the server.
    const resizeDisposable = term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols, rows }))
      }
    })

    // Refit when the browser window changes size.
    const handleWindowResize = () => {
      try {
        fit.fit()
      } catch {
        // ignore
      }
    }
    window.addEventListener('resize', handleWindowResize)

    // ---- Cleanup ----
    return () => {
      window.removeEventListener('resize', handleWindowResize)
      dataDisposable.dispose()
      resizeDisposable.dispose()

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }

      term.dispose()

      termRef.current = null
      fitRef.current = null
      wsRef.current = null
    }
  }, [wsUrl]) // Re-run only when the WebSocket URL changes.

  // ---- Render ----

  const stateColors: Record<ConnectionState, string> = {
    connecting: theme.colors.warning,
    connected: theme.colors.success,
    disconnected: theme.colors.danger,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.codeBg,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          fontSize: theme.fontSize.sm,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: stateColors[connState],
            flexShrink: 0,
          }}
        />
        <span style={{ color: theme.colors.textSecondary }}>
          {podName}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            color: stateColors[connState],
            fontWeight: 500,
            textTransform: 'capitalize',
          }}
        >
          {connState}
        </span>
      </div>

      {/* Terminal container */}
      <div
        ref={containerRef}
        style={{
          flexGrow: 1,
          minHeight: 300,
          padding: theme.spacing.xs,
        }}
      />
    </div>
  )
}
