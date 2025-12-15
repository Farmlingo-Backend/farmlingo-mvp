import swaggerJsdoc from 'swagger-jsdoc';
import { appName, nodeEnv } from './config';
import { swaggerComponents } from './swagger-components';

const serverUrl =
  process.env.API_BASE_URL && /^https?:\/\//.test(process.env.API_BASE_URL)
    ? process.env.API_BASE_URL
    : '/api';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: `${appName} API`,
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
    { name: 'Chat', description: 'Chat Routes (chat.route.ts)' },
    { name: 'Chats', description: 'Direct Messaging Routes (chats.route.ts)' }
  ],
  servers: [
    {
      url: serverUrl,
      description: `${nodeEnv} server`
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
    ...swaggerComponents
  }
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
