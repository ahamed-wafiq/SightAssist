import UserSettings from '../models/UserSettings.js';
import { getDBStatus } from '../config/db.js';

// Default in-memory settings fallback
let defaultMemorySettings = {
  userId: 'default_user',
  voiceAlertsEnabled: true,
  speechRate: 1.0,
  speakDistance: true,
  speakDirection: true,
  confidenceThreshold: 0.5,
  vibrationEnabled: true,
  displayMode: 'light',
  preferredCamera: 'environment',
  emergencyContacts: [],
};

/**
 * Fetch User Settings
 * GET /api/settings
 */
export const getSettings = async (req, res) => {
  try {
    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      return res.status(200).json({
        success: true,
        source: 'memory',
        settings: defaultMemorySettings,
      });
    }

    let settings = await UserSettings.findOne({ userId: 'default_user' });

    if (!settings) {
      // Seed default settings on first request
      settings = await UserSettings.create(defaultMemorySettings);
    }

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      settings,
    });
  } catch (err) {
    console.error('[SettingsController] Error fetching settings:', err);
    return res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
};

/**
 * Update User Settings
 * PUT /api/settings
 */
export const updateSettings = async (req, res) => {
  try {
    const isDbConnected = getDBStatus() === 'connected';
    const updates = req.body;

    // Filter allowed fields
    const allowedFields = [
      'voiceAlertsEnabled',
      'speechRate',
      'speakDistance',
      'speakDirection',
      'confidenceThreshold',
      'vibrationEnabled',
      'displayMode',
      'preferredCamera',
      'emergencyContacts',
    ];

    const sanitizedUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (!isDbConnected) {
      defaultMemorySettings = { ...defaultMemorySettings, ...sanitizedUpdates };
      return res.status(200).json({
        success: true,
        source: 'memory',
        message: 'Settings updated in memory',
        settings: defaultMemorySettings,
      });
    }

    const updated = await UserSettings.findOneAndUpdate(
      { userId: 'default_user' },
      { $set: sanitizedUpdates },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      message: 'Settings updated successfully',
      settings: updated,
    });
  } catch (err) {
    console.error('[SettingsController] Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
};
