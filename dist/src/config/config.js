"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpiresIn = exports.jwtSecret = exports.healthMessage = exports.appName = exports.nodeEnv = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.port = process.env.PORT ? Number(process.env.PORT) : 4000;
exports.nodeEnv = process.env.NODE_ENV || 'development';
exports.appName = process.env.APP_NAME || 'farmlingo-backend';
exports.healthMessage = process.env.HEALTH_OK_MESSAGE || 'ok';
exports.jwtSecret = process.env.JWT_SECRET_KEY || 'change-me';
exports.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
