import http from 'http';
import app from './src/app';
import { port, appName } from './src/config/config';

const server = http.createServer(app);

server.listen(port, () => {

  // eslint-disable-next-line no-console(with this you will see the full URL in the console.)
  // console.log(`${appName} listening on port ${port} — env=${process.env.NODE_ENV || 'development'}`);

  // eslint-disable-next-line no-console(this help you see the full URL in the console.)
  console.log(`${appName} listening at http://localhost:${port} — env=${process.env.NODE_ENV || 'development'}`);
  // With this you will see the Swagger UI url
  console.log(`Swagger UI: http://localhost:${port}/api-docs/#/`);
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('SIGINT received: shutting down');
  server.close(() => process.exit(0));
});
