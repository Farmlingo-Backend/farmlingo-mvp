"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const os_1 = __importDefault(require("os"));
const config_1 = require("../config/config");
const dbconfig_1 = require("../db/dbconfig");
const drizzle_orm_1 = require("drizzle-orm");
function getUptimeSeconds() {
    return Math.floor(process.uptime());
}
async function getDependencyDetails() {
    const databaseEnv = process.env.HEALTH_DB_STATUS;
    const cache = process.env.HEALTH_CACHE_STATUS;
    const externalApi = process.env.HEALTH_EXTERNAL_API_STATUS;
    const messageBroker = process.env.HEALTH_MESSAGE_BROKER_STATUS;
    let database = databaseEnv !== null && databaseEnv !== void 0 ? databaseEnv : 'ok';
    try {
        await dbconfig_1.db.execute((0, drizzle_orm_1.sql) `select 1`);
        database = 'ok';
    }
    catch {
        database = 'down';
    }
    return {
        database,
        cache: cache !== null && cache !== void 0 ? cache : 'ok',
        externalApi: externalApi !== null && externalApi !== void 0 ? externalApi : 'ok',
        messageBroker: messageBroker !== null && messageBroker !== void 0 ? messageBroker : 'ok'
    };
}
function computeOverallStatus(details) {
    const states = Object.values(details);
    const unhealthyStates = ['unhealthy', 'down', 'error'];
    if (states.some((state) => unhealthyStates.includes(state))) {
        return 'unhealthy';
    }
    if (states.some((state) => state !== 'ok')) {
        return 'degraded';
    }
    return 'ok';
}
const getHealth = async (req, res) => {
    const details = await getDependencyDetails();
    const status = computeOverallStatus(details);
    const unhealthyStates = ['unhealthy', 'down', 'error', 'offline'];
    const failingDeps = Object.entries(details).filter(([, state]) => unhealthyStates.includes(state));
    const error = status === 'unhealthy'
        ? process.env.HEALTH_ERROR_MESSAGE ||
            (failingDeps.length
                ? `Unhealthy dependencies: ${failingDeps
                    .map(([name, state]) => `${name}=${state}`)
                    .join(', ')}`
                : 'Service is unhealthy')
        : undefined;
    const payload = {
        status,
        message: config_1.healthMessage,
        ...(error ? { error } : {}),
        uptime_seconds: getUptimeSeconds(),
        version: process.env.API_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        details,
        system: {
            platform: os_1.default.platform(),
            cpu_count: os_1.default.cpus().length,
            memory_total: os_1.default.totalmem()
        }
    };
    return res.status(status === 'unhealthy' ? 503 : 200).json(payload);
};
exports.getHealth = getHealth;
