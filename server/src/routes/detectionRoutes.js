import express from 'express';
import {
  saveDetection,
  getDetections,
  getRecentDetections,
  clearDetections,
} from '../controllers/detectionController.js';

const router = express.Router();

// POST /api/detections - Record detected object(s)
router.post('/', saveDetection);

// GET /api/detections - Fetch detection logs (limit query supported)
router.get('/', getDetections);

// GET /api/detections/recent - Fetch 20 most recent detections
router.get('/recent', getRecentDetections);

// DELETE /api/detections - Clear detection history
router.delete('/', clearDetections);

export default router;
