"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.warn = exports.info = exports.logger = exports.LogLevel = void 0;
const util_1 = __importDefault(require("util"));
const LOG_PREFIX = '[farmlingo]';
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        // Legacy methods for backward compatibility
        this.log = this.info;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...(data && { data })
        };
        if (data) {
            return `${LOG_PREFIX} ${level.toUpperCase()}: ${message} ${util_1.default.inspect(data, { depth: 2 })}`;
        }
        return `${LOG_PREFIX} ${level.toUpperCase()}: ${message}`;
    }
    info(message, data) {
        console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
    warn(message, data) {
        console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
    error(message, error) {
        console.error(this.formatMessage(LogLevel.ERROR, message, error));
    }
    debug(message, data) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
        }
    }
}
exports.logger = new Logger();
// Legacy exports for backward compatibility
exports.info = exports.logger.info.bind(exports.logger);
exports.warn = exports.logger.warn.bind(exports.logger);
exports.error = exports.logger.error.bind(exports.logger);
