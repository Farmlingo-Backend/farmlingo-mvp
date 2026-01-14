import util from 'util';

const LOG_PREFIX = '[farmlingo]';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    if (data) {
      return `${LOG_PREFIX} ${level.toUpperCase()}: ${message} ${util.inspect(data, { depth: 2 })}`;
    }

    return `${LOG_PREFIX} ${level.toUpperCase()}: ${message}`;
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error | any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, error));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  // Legacy methods for backward compatibility
  log = this.info;
}

export const logger = new Logger();

// Legacy exports for backward compatibility
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
