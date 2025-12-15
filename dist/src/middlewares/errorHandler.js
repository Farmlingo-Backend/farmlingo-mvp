"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
    const status = err.status || 500;
    const payload = {
        message: err.message || 'Internal Server Error',
        status,
        timestamp: new Date().toISOString()
    };
    if (process.env.NODE_ENV !== 'production') {
        payload.stack = err.stack;
    }
    res.status(status).json(payload);
};
exports.errorHandler = errorHandler;
