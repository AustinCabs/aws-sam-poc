type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[currentLevel];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...context,
  };
  return JSON.stringify(payload);
}

export function debug(message: string, context?: LogContext): void {
  if (shouldLog("debug")) {
    console.log(formatMessage("debug", message, context));
  }
}

export function info(message: string, context?: LogContext): void {
  if (shouldLog("info")) {
    console.log(formatMessage("info", message, context));
  }
}

export function warn(message: string, context?: LogContext): void {
  if (shouldLog("warn")) {
    console.warn(formatMessage("warn", message, context));
  }
}

export function error(message: string, context?: LogContext): void {
  if (shouldLog("error")) {
    console.error(formatMessage("error", message, context));
  }
}
