/**
 * Structured logger for PolyGPA Calculator.
 *
 * Format rules:
 *   - Deployed on Vercel  → JSON (Vercel's log aggregator can filter/search it)
 *   - Anywhere else       → pretty coloured lines (dev, `npm start`, CI)
 *
 * Log levels:
 *   - debug : dev-only, suppressed on Vercel
 *   - info  : normal operations
 *   - warn  : unexpected but recoverable situations
 *   - error : failures that need attention
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  ts: string;
  ns: string;
  msg: string;
  [key: string]: unknown;
}

// ── Environment detection ─────────────────────────────────────────────────────
// Only emit JSON when actually running inside a Vercel deployment.
// `npm start` locally still gets pretty logs even though NODE_ENV=production.
const ON_VERCEL = Boolean(process.env.VERCEL);
const IS_DEV = process.env.NODE_ENV !== 'production';

// Suppress debug on Vercel (too noisy in the cloud log viewer).
const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = ON_VERCEL ? 'info' : 'debug';

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const C: Record<LogLevel, string> = {
  debug: '\x1b[34m', // blue
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// Level badge strings, fixed width
const BADGE: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: ' INFO',
  warn: ' WARN',
  error: 'ERROR',
};

// ── Formatter ─────────────────────────────────────────────────────────────────
function formatPretty(level: LogLevel, ns: string, msg: string, ctx?: Record<string, unknown>): string {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8); // HH:MM:SS
  const badge = `${C[level]}${BOLD}${BADGE[level]}${RESET}`;
  const nsStr = `${DIM}[${ns}]${RESET}`;
  const ctxStr = ctx && Object.keys(ctx).length
    ? ` | ${DIM}${Object.entries(ctx).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('  ')}${RESET}`
    : '';
  return `${DIM}${time}${RESET} ${badge} ${nsStr}  ${msg}${ctxStr}`;
}

function formatJson(level: LogLevel, ns: string, msg: string, ctx?: Record<string, unknown>): string {
  const entry: LogEntry = { level, ts: new Date().toISOString(), ns, msg, ...ctx };
  return JSON.stringify(entry);
}

// ── Core write ────────────────────────────────────────────────────────────────
function write(level: LogLevel, ns: string, msg: string, ctx?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) return;

  const output = ON_VERCEL
    ? formatJson(level, ns, msg, ctx)
    : formatPretty(level, ns, msg, ctx);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a namespaced child logger.
 *
 * Usage:
 *   const log = createLogger('actions:calculation');
 *   log.info('Calculation saved', { calcId, cgpa });
 *   log.error('DB write failed', { error: err.message });
 */
export function createLogger(namespace: string) {
  return {
    debug: (msg: string, ctx?: Record<string, unknown>) => write('debug', namespace, msg, ctx),
    info: (msg: string, ctx?: Record<string, unknown>) => write('info', namespace, msg, ctx),
    warn: (msg: string, ctx?: Record<string, unknown>) => write('warn', namespace, msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>) => write('error', namespace, msg, ctx),
  };
}

/** Root logger — prefer namespaced loggers via createLogger(). */
export const logger = createLogger('app');
