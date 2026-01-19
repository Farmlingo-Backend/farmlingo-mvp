import http from 'http';
import app from './src/app';
import { port, appName } from './src/config/config';
import { websocketService } from './src/services/websocket.service';
import detectPort from 'detect-port';

const server = http.createServer(app);

// Initialize WebSocket service
websocketService.initialize(server);

const startServer = async () => {
  try {
    const availablePort = await detectPort(port);
    if (availablePort !== port) {
      console.log(`Port ${port} is busy. Using port ${availablePort} instead.`);
    }
    server.listen(availablePort, () => {
      console.log(`${appName} listening at http://localhost:${availablePort} — env=${process.env.NODE_ENV || 'development'}`);
      console.log(`Swagger UI: http://localhost:${availablePort}/api-docs/#/`);
      console.log(`WebSocket server initialized`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', () => {
  console.log('SIGINT received: shutting down');
  server.close(() => process.exit(0));
});
