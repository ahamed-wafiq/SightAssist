import mongoose from 'mongoose';

/**
 * Emergency Contact Sub-Schema
 */
const EmergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      default: 'Family',
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

/**
 * User Settings Schema
 * Stores user accessibility preferences and emergency contacts in MongoDB.
 */
const UserSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      unique: true,
      index: true,
    },

    // 1. Voice Preferences
    voiceAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    speechRate: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    speakDistance: {
      type: Boolean,
      default: true,
    },
    speakDirection: {
      type: Boolean,
      default: true,
    },

    // 2. Detection Preferences
    confidenceThreshold: {
      type: Number,
      default: 0.5,
      min: 0.2,
      max: 0.9,
    },

    // 3. Accessibility Preferences
    vibrationEnabled: {
      type: Boolean,
      default: true,
    },
    displayMode: {
      type: String,
      enum: ['light', 'high-contrast'],
      default: 'light',
    },

    // 4. Camera Selection
    preferredCamera: {
      type: String,
      enum: ['environment', 'user'],
      default: 'environment',
    },

    // 5. Emergency Contacts
    emergencyContacts: [EmergencyContactSchema],
  },
  {
    timestamps: true,
  }
);

export const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);
export default UserSettings;
