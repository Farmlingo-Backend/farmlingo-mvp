"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./src/app"));
const config_1 = require("./src/config/config");
const websocket_service_1 = require("./src/services/websocket.service");
const detect_port_1 = __importDefault(require("detect-port"));
const server = http_1.default.createServer(app_1.default);
// Initialize WebSocket service
websocket_service_1.websocketService.initialize(server);
const startServer = async () => {
    try {
        const availablePort = await (0, detect_port_1.default)(config_1.port);
        if (availablePort !== config_1.port) {
            console.log(`Port ${config_1.port} is busy. Using port ${availablePort} instead.`);
        }
        server.listen(availablePort, () => {
            console.log(`${config_1.appName} listening at http://localhost:${availablePort} — env=${process.env.NODE_ENV || 'development'}`);
            console.log(`Swagger UI: http://localhost:${availablePort}/api-docs/#/`);
            console.log(`WebSocket server initialized`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
startServer();
process.on('SIGINT', () => {
    console.log('SIGINT received: shutting down');
    server.close(() => process.exit(0));
});
