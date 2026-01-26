type LogLevel = "debug" | "info" | "warn" | "error";

function getLogLevel(): LogLevel {
  const v = (process.env.LOG_LEVEL || "").toLowerCase();
  if (v === "debug" || v === "info" || v === "warn" || v === "error") return v;

  // default: dev = debug, prod = info
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CURRENT_LEVEL = getLogLevel();
const currentLevelRank = LEVEL_ORDER[CURRENT_LEVEL];

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= currentLevelRank;
}

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

function fmt(level: string, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  const requestId = context?.requestId ? `[${context.requestId}]` : "";
  return [`${level} ${timestamp} ${requestId} ${message}`, context].filter(Boolean);
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (!shouldLog("debug")) return;
    console.log(...fmt("🔍 [DEBUG]", message, context));
  },
  info: (message: string, context?: LogContext) => {
    if (!shouldLog("info")) return;
    console.log(...fmt("🟢 [INFO]", message, context));
  },
  warn: (message: string, context?: LogContext) => {
    if (!shouldLog("warn")) return;
    console.warn(...fmt("🟠 [WARN]", message, context));
  },
  error: (message: string, context?: LogContext) => {
    if (!shouldLog("error")) return;
    console.error(...fmt("🔴 [ERROR]", message, context));
  },
};
