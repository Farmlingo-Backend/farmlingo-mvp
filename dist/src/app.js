"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = __importDefault(require("./routes"));
const requestLogger_1 = require("./middlewares/requestLogger");
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_1 = __importDefault(require("./config/swagger"));
const app = (0, express_1.default)();
// Core middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.options('*', (0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Logging - use morgan for simple combined logging
app.use((0, morgan_1.default)('dev'));
app.use(requestLogger_1.requestLogger);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, {
    swaggerOptions: {
        persistAuthorization: true,
        requestInterceptor: (req) => {
            req.credentials = 'include';
            return req;
        },
    },
}));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.default);
});
// API routes
app.use('/api', routes_1.default);
// Root friendly message
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Farmlingo backend running. Visit /api/health to check API health.'
    });
});
// Error handling (always last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
