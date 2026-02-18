/**
 * @deprecated The dark theme tokens are superseded by the Tailwind CSS v4
 * theme in `apps/web/app/globals.css`. This file is kept for backward
 * compatibility with tests and server code that may reference `theme`.
 *
 * Provides a centralized theme object with color, spacing, radius, and
 * font-size tokens, plus a global CSS string that sets :root custom
 * properties and base element styles.
 */

export const theme = {
  colors: {
    bg: '#0d1117',
    surface: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    textSecondary: '#8b949e',
    primary: '#58a6ff',
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
    codeBg: '#0d1117',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '18px',
    xl: '24px',
  },
} as const

export type Theme = typeof theme

/**
 * Global CSS string that applies :root custom properties derived from the
 * theme tokens and sets sensible base styles for the dashboard.
 */
export const globalStyles = `
:root {
  /* Colors */
  --color-bg: ${theme.colors.bg};
  --color-surface: ${theme.colors.surface};
  --color-border: ${theme.colors.border};
  --color-text: ${theme.colors.text};
  --color-text-secondary: ${theme.colors.textSecondary};
  --color-primary: ${theme.colors.primary};
  --color-success: ${theme.colors.success};
  --color-warning: ${theme.colors.warning};
  --color-danger: ${theme.colors.danger};
  --color-code-bg: ${theme.colors.codeBg};

  /* Spacing */
  --spacing-xs: ${theme.spacing.xs};
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};
  --spacing-xl: ${theme.spacing.xl};

  /* Radius */
  --radius-sm: ${theme.radius.sm};
  --radius-md: ${theme.radius.md};
  --radius-lg: ${theme.radius.lg};

  /* Font sizes */
  --font-xs: ${theme.fontSize.xs};
  --font-sm: ${theme.fontSize.sm};
  --font-md: ${theme.fontSize.md};
  --font-lg: ${theme.fontSize.lg};
  --font-xl: ${theme.fontSize.xl};
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: var(--font-md);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code, pre {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: var(--color-code-bg);
  border-radius: var(--radius-sm);
}

button {
  font-family: inherit;
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
`
