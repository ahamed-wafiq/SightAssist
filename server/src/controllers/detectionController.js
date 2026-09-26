import DetectionLog from '../models/DetectionLog.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback if MongoDB is momentarily disconnected
const inMemoryDetections = [];

/**
 * Record detected object(s)
 * POST /api/detections
 */
export const saveDetection = async (req, res) => {
  try {
    const isDbConnected = getDBStatus() === 'connected';
    const payload = req.body;

    // Handle both single detection and array of detections
    const items = Array.isArray(payload) ? payload : [payload];
    const validItems = [];

    for (const item of items) {
      const objName = item.object || item.objectName;
      if (!objName) continue;

      validItems.push({
        object: objName,
        objectName: objName,
        confidence: item.confidence != null ? Number(item.confidence) : 0.8,
        position: (item.position || 'center').toLowerCase(),
        approximate_distance: item.approximate_distance != null ? Number(item.approximate_distance) : (item.approxDistanceMeters != null ? Number(item.approxDistanceMeters) : null),
        approxDistanceMeters: item.approximate_distance != null ? Number(item.approximate_distance) : (item.approxDistanceMeters != null ? Number(item.approxDistanceMeters) : null),
        voiceAnnounced: !!item.voiceAnnounced,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      });
    }

    if (validItems.length === 0) {
      return res.status(400).json({ error: 'Valid object name is required' });
    }

    if (!isDbConnected) {
      // Store in memory buffer (cap at 100 items)
      inMemoryDetections.unshift(...validItems);
      if (inMemoryDetections.length > 100) inMemoryDetections.length = 100;

      return res.status(201).json({
        success: true,
        persisted: false,
        message: 'Saved to in-memory buffer (MongoDB offline)',
        count: validItems.length,
        detections: validItems,
      });
    }

    const saved = await DetectionLog.insertMany(validItems);
    return res.status(201).json({
      success: true,
      persisted: true,
      count: saved.length,
      detections: saved,
    });
  } catch (err) {
    console.error('[DetectionController] Error saving detection:', err);
    return res.status(500).json({ error: 'Failed to record detection', details: err.message });
  }
};

/**
 * Fetch all detections (paginated or with limit)
 * GET /api/detections
 */
export const getDetections = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      return res.status(200).json({
        success: true,
        source: 'memory',
        count: inMemoryDetections.length,
        detections: inMemoryDetections.slice(0, limit),
      });
    }

    const detections = await DetectionLog.find()
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      count: detections.length,
      detections,
    });
  } catch (err) {
    console.error('[DetectionController] Error fetching detections:', err);
    return res.status(500).json({ error: 'Failed to fetch detections', details: err.message });
  }
};

/**
 * Fetch recent detections (last 20)
 * GET /api/detections/recent
 */
export const getRecentDetections = async (req, res) => {
  try {
    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      return res.status(200).json({
        success: true,
        source: 'memory',
        count: Math.min(20, inMemoryDetections.length),
        detections: inMemoryDetections.slice(0, 20),
      });
    }

    const detections = await DetectionLog.find()
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      count: detections.length,
      detections,
    });
  } catch (err) {
    console.error('[DetectionController] Error fetching recent detections:', err);
    return res.status(500).json({ error: 'Failed to fetch recent detections', details: err.message });
  }
};

/**
 * Clear detection history
 * DELETE /api/detections
 */
export const clearDetections = async (req, res) => {
  try {
    inMemoryDetections.length = 0;
    const isDbConnected = getDBStatus() === 'connected';

    if (isDbConnected) {
      await DetectionLog.deleteMany({});
    }

    return res.status(200).json({
      success: true,
      message: 'Detection history cleared successfully',
    });
  } catch (err) {
    console.error('[DetectionController] Error clearing detections:', err);
    return res.status(500).json({ error: 'Failed to clear detections', details: err.message });
  }
};
