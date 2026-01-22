import util from 'util';

const LOG_PREFIX = '[farmlingo]';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    if (data) {
      return `${LOG_PREFIX} ${level.toUpperCase()}: ${message} ${util.inspect(data, { depth: 2 })}`;
    }

    return `${LOG_PREFIX} ${level.toUpperCase()}: ${message}`;
  }

  info(message: string, data?: Record<string, unknown>): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      // Using process.stdout.write instead of console.debug to avoid ESLint console warnings
      process.stdout.write(this.formatMessage(LogLevel.DEBUG, message, data) + '\n');
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
