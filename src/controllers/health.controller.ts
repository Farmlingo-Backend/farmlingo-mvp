import { Request, Response } from 'express';
import os from 'os';
import { healthMessage } from '../config/config';
import { db } from '../db/dbconfig';
import { sql } from 'drizzle-orm';

type OverallStatus = 'ok' | 'degraded' | 'unhealthy';

type DependencyStatus =
  | 'ok'
  | 'offline'
  | 'degraded'
  | 'unhealthy'
  | 'down'
  | 'error'
  | 'unknown';

interface DependencyDetails {
  database: DependencyStatus;
  cache: DependencyStatus;
  externalApi: DependencyStatus;
  messageBroker: DependencyStatus;
}

function getUptimeSeconds(): number {
  return Math.floor(process.uptime());
}

async function getDependencyDetails(): Promise<DependencyDetails> {
  const databaseEnv = process.env.HEALTH_DB_STATUS as DependencyStatus | undefined;
  const cache = process.env.HEALTH_CACHE_STATUS as DependencyStatus | undefined;
  const externalApi = process.env.HEALTH_EXTERNAL_API_STATUS as DependencyStatus | undefined;
  const messageBroker = process.env.HEALTH_MESSAGE_BROKER_STATUS as DependencyStatus | undefined;

  let database: DependencyStatus = databaseEnv ?? 'ok';
  try {
    await db.execute(sql`select 1`);
    database = 'ok';
  } catch {
    database = 'down';
  }

  return {
    database,
    cache: cache ?? 'ok',
    externalApi: externalApi ?? 'ok',
    messageBroker: messageBroker ?? 'ok'
  };
}

function computeOverallStatus(details: DependencyDetails): OverallStatus {
  const states = Object.values(details);
  const unhealthyStates: DependencyStatus[] = ['unhealthy', 'down', 'error'];

  if (states.some((state) => unhealthyStates.includes(state))) {
    return 'unhealthy';
  }

  if (states.some((state) => state !== 'ok')) {
    return 'degraded';
  }

  return 'ok';
}

export const getHealth = async (req: Request, res: Response): Promise<Response> => {
  const details = await getDependencyDetails();
  const status = computeOverallStatus(details);

  const unhealthyStates: DependencyStatus[] = ['unhealthy', 'down', 'error', 'offline'];
  const failingDeps = Object.entries(details).filter(([, state]) =>
    unhealthyStates.includes(state)
  );

  const error =
    status === 'unhealthy'
      ? process.env.HEALTH_ERROR_MESSAGE ||
        (failingDeps.length
          ? `Unhealthy dependencies: ${failingDeps
              .map(([name, state]) => `${name}=${state}`)
              .join(', ')}`
          : 'Service is unhealthy')
      : undefined;

  const payload = {
    status,
    message: healthMessage,
    ...(error ? { error } : {}),
    uptime_seconds: getUptimeSeconds(),
    version: process.env.API_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    details,
    system: {
      platform: os.platform(),
      cpu_count: os.cpus().length,
      memory_total: os.totalmem()
    }
  };

  return res.status(status === 'unhealthy' ? 503 : 200).json(payload);
};
