"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../../utils/logger");
const requestLogger = (req, res, next) => {
    logger_1.logger.info(`Request: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
};
exports.requestLogger = requestLogger;
