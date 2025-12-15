import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import swaggerSpec from './config/swagger';

const app: Application = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

// IMPORTANT: Webhook route needs raw body for signature verification
// Apply raw body parser ONLY to webhook routes before JSON parser
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Apply JSON parser to all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging - use morgan for simple combined logging
app.use(morgan('dev'));
app.use(requestLogger);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      requestInterceptor: (req: any) => {
        req.credentials = 'include';
        return req;
      },
    },
  })
);
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api', routes);

// Root friendly message
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Farmlingo backend running. Visit /api/health to check API health.'
  });
});

// Error handling (always last)
app.use(errorHandler);

export default app;
