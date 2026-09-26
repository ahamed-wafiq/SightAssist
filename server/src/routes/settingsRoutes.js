import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

// GET /api/settings - Fetch accessibility and user preferences
router.get('/', getSettings);

// PUT /api/settings - Update accessibility and user preferences
router.put('/', updateSettings);

export default router;
