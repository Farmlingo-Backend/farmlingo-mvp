"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkSecretKey = exports.clerkPublishableKey = exports.clerkWebhookSecret = exports.jwtExpiresIn = exports.jwtSecret = exports.healthMessage = exports.appName = exports.nodeEnv = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.port = process.env.PORT ? Number(process.env.PORT) : 5003;
exports.nodeEnv = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
exports.appName = (_b = process.env.APP_NAME) !== null && _b !== void 0 ? _b : 'farmlingo-backend';
exports.healthMessage = (_c = process.env.HEALTH_OK_MESSAGE) !== null && _c !== void 0 ? _c : 'ok';
exports.jwtSecret = (_d = process.env.JWT_SECRET_KEY) !== null && _d !== void 0 ? _d : (() => { throw new Error('JWT_SECRET_KEY environment variable is required'); })();
exports.jwtExpiresIn = (_e = process.env.JWT_EXPIRES_IN) !== null && _e !== void 0 ? _e : '1h';
// Clerk configuration
exports.clerkWebhookSecret = (_f = process.env.CLERK_WEBHOOK_SECRET) !== null && _f !== void 0 ? _f : '';
exports.clerkPublishableKey = (_g = process.env.CLERK_PUBLISHABLE_KEY) !== null && _g !== void 0 ? _g : '';
exports.clerkSecretKey = (_h = process.env.CLERK_SECRET_KEY) !== null && _h !== void 0 ? _h : '';
