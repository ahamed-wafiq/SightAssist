import mongoose from 'mongoose';

/**
 * DetectionLog Schema
 * Stores historical detection logs with object, confidence, position, distance, and timestamp.
 * Note: Camera video/images are NEVER stored.
 */
const DetectionLogSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true,
      trim: true,
    },
    // Alias objectName for backwards compatibility
    objectName: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    position: {
      type: String,
      enum: ['left', 'center', 'right', 'Left', 'Center', 'Right', 'Unknown'],
      default: 'center',
    },
    approximate_distance: {
      type: Number,
      default: null,
    },
    // Alias approxDistanceMeters for backwards compatibility
    approxDistanceMeters: {
      type: Number,
      default: null,
    },
    voiceAnnounced: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to keep aliases synchronized
DetectionLogSchema.pre('save', function (next) {
  if (this.object && !this.objectName) {
    this.objectName = this.object;
  } else if (this.objectName && !this.object) {
    this.object = this.objectName;
  }

  if (this.approximate_distance != null && this.approxDistanceMeters == null) {
    this.approxDistanceMeters = this.approximate_distance;
  } else if (this.approxDistanceMeters != null && this.approximate_distance == null) {
    this.approximate_distance = this.approxDistanceMeters;
  }

  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  next();
});

export const DetectionLog = mongoose.model('DetectionLog', DetectionLogSchema);
export default DetectionLog;
