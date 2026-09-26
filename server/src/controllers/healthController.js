import { getDBStatus } from '../config/db.js';

/**
 * Health check endpoint controller
 * GET /api/health
 */
export const getHealth = (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    status: 'ok',
    service: 'SightAssist API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      connected: dbStatus === 'connected',
    },
    message: 'SightAssist backend is operational.',
  });
};
