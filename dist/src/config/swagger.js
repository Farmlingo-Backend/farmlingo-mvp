"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = require("./config");
const swagger_components_1 = require("./swagger-components");
const serverUrl = process.env.API_BASE_URL && /^https?:\/\//.test(process.env.API_BASE_URL)
    ? process.env.API_BASE_URL
    : '/api';
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: `${config_1.appName} API`,
        version: process.env.API_VERSION || '1.0.0',
        description: 'API documentation for the Farmlingo backend API'
    },
    // Control tag display order in Swagger UI
    tags: [
        { name: 'Health', description: 'Health Routes' },
        { name: 'Users', description: 'User Routes' },
        { name: 'Courses', description: 'Courses Routes (courses.route.ts)' },
        { name: 'Lessons', description: 'Lessons Routes (lessons.route.ts)' },
        { name: 'Enrollments', description: 'Enrollments Routes (enrollments.route.ts)' },
        { name: 'Forums', description: 'Forums Routes (forums.route.ts)' },
        { name: 'Chat', description: 'Chat Routes (chat.route.ts)' }
    ],
    servers: [
        {
            url: serverUrl,
            description: `${config_1.nodeEnv} server`
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        ...swagger_components_1.swaggerComponents
    }
};
const options = {
    definition: swaggerDefinition,
    apis: [
        'src/routes/**/*.ts',
        'src/controllers/**/*.ts'
    ]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
