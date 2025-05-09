type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
}

class Logger {
  private context: Record<string, any> = {}

  constructor(private serviceName: string) {}

  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context }
    return this
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.context,
        ...context,
        service: this.serviceName,
      },
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry("debug", message, context)
    if (process.env.NODE_ENV !== "production") {
      console.debug(JSON.stringify(entry))
    }
    return entry
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry("info", message, context)
    console.info(JSON.stringify(entry))
    return entry
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry("warn", message, context)
    console.warn(JSON.stringify(entry))
    return entry
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    const errorContext = error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          ...(error.code ? { errorCode: error.code } : {}),
        }
      : {}

    const entry = this.createLogEntry("error", message, {
      ...errorContext,
      ...context,
    })

    console.error(JSON.stringify(entry))
    return entry
  }
}

export function createLogger(serviceName: string) {
  return new Logger(serviceName)
}
