import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API and system health
 *     description: Returns overall service health, dependency status, and basic system information.
 *     responses:
 *       '200':
 *         description: Service is healthy or degraded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Overall health status.
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: ok
 *                 uptime_seconds:
 *                   type: integer
 *                   format: int64
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 env:
 *                   type: string
 *                 details:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     cache:
 *                       type: string
 *                     externalApi:
 *                       type: string
 *                     messageBroker:
 *                       type: string
 *                 system:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                     cpu_count:
 *                       type: integer
 *                     memory_total:
 *                       type: integer
 *       '503':
 *         description: Service is unhealthy.
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/', getHealth);

export default router;
