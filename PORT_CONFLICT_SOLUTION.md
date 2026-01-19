# Port Conflict Solution

## Error Analysis

The error `EADDRINUSE: address already in use :::5003` occurs when:

1. **Another instance of the application is already running**
2. **Another service is using port 5003**
3. **A previous instance didn't shut down properly**

## Solutions

### Solution 1: Kill the Process Using Port 5003

**Windows:**
```bash
# Find the process using port 5003
netstat -ano | findstr :5003

# Kill the process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

**Alternative Windows method:**
```bash
# Find and kill in one command
for /f "tokens=5" %a in ('netstat -aon ^| findstr :5003') do taskkill /f /pid %a
```

### Solution 2: Use a Different Port

**Option A: Change the default port in config**
Edit `src/config/config.ts`:
```typescript
export const port: number = process.env.PORT ? Number(process.env.PORT) : 5004; // Changed from 5003 to 5004
```

**Option B: Set PORT environment variable**
```bash
# Set environment variable before running
set PORT=5004
npm run dev
```

**Option C: Use command line**
```bash
# Run with different port
PORT=5004 npm run dev
```

### Solution 3: Add Port Conflict Handling

**Enhanced server.ts with automatic port fallback:**
```typescript
import http from 'http';
import app from './src/app';
import { port, appName } from './src/config/config';

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`${appName} listening at http://localhost:${port} — env=${process.env.NODE_ENV || 'development'}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs/#/`);
});

// Handle port conflicts gracefully
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying alternative port...`);
    
    // Try alternative ports
    const alternativePorts = [5004, 5005, 5006, 3000, 8080];
    
    for (const altPort of alternativePorts) {
      try {
        server.listen(altPort, () => {
          console.log(`${appName} listening at http://localhost:${altPort} — env=${process.env.NODE_ENV || 'development'}`);
          console.log(`Swagger UI: http://localhost:${altPort}/api-docs/#/`);
          return;
        });
        break;
      } catch (error) {
        continue;
      }
    }
    
    console.error('Could not find an available port. Please free up port 5003 or set a different PORT environment variable.');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received: shutting down');
  server.close(() => process.exit(0));
});
```

### Solution 4: Check for Running Processes

**Check what's using port 5003:**
```bash
# Windows
netstat -ano | findstr :5003
tasklist | findstr [PID]

# Linux/Mac
lsof -i :5003
ps aux | grep [PID]
```

### Solution 5: Use Process Manager

**Using PM2 (if installed):**
```bash
# List running processes
pm2 list

# Stop specific process
pm2 stop farmlingo-backend

# Or stop all
pm2 delete all
```

## Recommended Approach

1. **First, try Solution 1** to kill any existing processes
2. **If that doesn't work, use Solution 2** to change the port
3. **For long-term solution, implement Solution 3** for automatic port fallback

## Quick Fix

To get your application running immediately:

```bash
# Kill any process using port 5003
for /f "tokens=5" %a in ('netstat -aon ^| findstr :5003') do taskkill /f /pid %a

# Or set a different port
set PORT=5004
npm run dev
```

This will resolve the port conflict and allow your application to start successfully.
