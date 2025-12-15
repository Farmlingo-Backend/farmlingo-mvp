"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./src/app"));
const config_1 = require("./src/config/config");
const detect_port_1 = __importDefault(require("detect-port"));
const server = http_1.default.createServer(app_1.default);
(0, detect_port_1.default)(config_1.port).then((freePort) => {
    if (freePort !== config_1.port) {
        console.log(`⚠️ Port ${config_1.port} is in use. Switching to ${freePort}`);
    }
    server.listen(freePort, () => {
        // eslint-disable-next-line no-console(with this you will see the full URL in the console.)
        // console.log(`${appName} listening on port ${port} — env=${process.env.NODE_ENV || 'development'}`);
        // eslint-disable-next-line no-console(this help you see the full URL in the console.)
        console.log(`${config_1.appName} listening at http://localhost:${freePort} — env=${process.env.NODE_ENV || 'development'}`);
        // With this you will see the Swagger UI url
        console.log(`Swagger UI: http://localhost:${freePort}/api-docs/#/`);
    });
});
process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log('SIGINT received: shutting down');
    server.close(() => process.exit(0));
});
