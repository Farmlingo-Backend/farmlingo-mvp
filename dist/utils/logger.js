"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.warn = exports.info = void 0;
const util_1 = __importDefault(require("util"));
const LOG_PREFIX = '[farmlingo]';
const info = (...args) => {
    // eslint-disable-next-line no-console
    console.log(LOG_PREFIX, util_1.default.format(...args));
};
exports.info = info;
const warn = (...args) => {
    // eslint-disable-next-line no-console
    console.warn(LOG_PREFIX, util_1.default.format(...args));
};
exports.warn = warn;
const error = (...args) => {
    // eslint-disable-next-line no-console
    console.error(LOG_PREFIX, util_1.default.format(...args));
};
exports.error = error;
