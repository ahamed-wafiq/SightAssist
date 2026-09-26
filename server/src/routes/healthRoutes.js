import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

// GET /api/health - Server health and database connection status
router.get('/', getHealth);

export default router;
