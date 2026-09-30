export type LogScope = 'ui' | 'api' | 'auth' | 'router'

// logs to the browser console and the terminal.
export function devLog(scope: LogScope, message: string): void {
  if (!import.meta.dev) return

  console.info(`%c[${scope}]%c ${message}`, 'color:#22c5e8;font-weight:600', '')
  fetch('/_dev/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, message }),
    keepalive: true,
  }).catch(() => {})
}
