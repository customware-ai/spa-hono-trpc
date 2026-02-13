type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const DEFAULT_LOG_LEVEL: LogLevel = 'info';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[DEFAULT_LOG_LEVEL];
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, context));
  },
  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info')) console.info(formatMessage('info', message, context));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, context));
  },
  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('error')) console.error(formatMessage('error', message, context));
  },
};
