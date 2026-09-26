/**
 * Intelligent Voice Manager for SightAssist
 * ==========================================
 * Manages audio announcements during continuous real-time assistance.
 * - Prevents repetitive audio spamming through cooldowns.
 * - Prioritizes CENTER and close obstacles.
 * - Detects significant state changes (e.g. distance changes significantly).
 * - Respects user preferences (voiceAlertsEnabled, speakDistance, speakDirection, vibrationEnabled).
 * - Speaks naturally and clearly.
 */

import speechService from './speech';

export class VoiceManager {
  constructor({ minCooldownMs = 3200, repeatIntervalMs = 12000 } = {}) {
    this.minCooldownMs = minCooldownMs;
    this.repeatIntervalMs = repeatIntervalMs;

    this.settings = {
      voiceAlertsEnabled: true,
      speakDistance: true,
      speakDirection: true,
      vibrationEnabled: true,
      speechRate: 1.0,
    };

    this.lastSpokenState = {
      object: null,
      position: null,
      distance: null,
      timestamp: 0,
      text: '',
    };

    this.clearPathAnnounced = false;
  }

  /**
   * Update active preferences
   */
  setSettings(newSettings = {}) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.settings.speechRate) {
      speechService.setRate(this.settings.speechRate);
    }
  }

  reset() {
    this.lastSpokenState = {
      object: null,
      position: null,
      distance: null,
      timestamp: 0,
      text: '',
    };
    this.clearPathAnnounced = false;
    speechService.stop();
  }

  /**
   * Formats distance text in natural, accessible words
   */
  formatDistanceWords(distance) {
    if (distance === null || distance === undefined) return '';
    const rounded = Math.round(distance * 10) / 10;
    if (rounded <= 1.0) {
      return 'approximately one meter';
    } else if (rounded >= 1.8 && rounded <= 2.2) {
      return 'approximately two meters';
    } else if (rounded >= 2.8 && rounded <= 3.2) {
      return 'approximately three meters';
    } else {
      return `approximately ${rounded} meters`;
    }
  }

  /**
   * Formats natural, accessible speech for an obstacle respecting settings
   */
  formatAnnouncement(item, isDistanceUpdate = false) {
    if (!item) return '';

    const rawName = item.object || 'obstacle';
    const objectName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const position = (item.position || 'center').toLowerCase();
    const distance = item.approximate_distance;

    // 1. Direction component (if enabled)
    let directionText = 'ahead';
    if (this.settings.speakDirection) {
      if (position === 'left') {
        directionText = 'on your left';
      } else if (position === 'right') {
        directionText = 'on your right';
      } else {
        directionText = 'ahead';
      }
    }

    // 2. Distance component (if enabled)
    const distWords = this.settings.speakDistance && distance != null
      ? this.formatDistanceWords(distance)
      : '';

    // Distance update phrasing: e.g. "Person is now approximately one meter ahead."
    if (isDistanceUpdate && distWords) {
      if (this.settings.speakDirection) {
        return `${objectName} is now ${distWords} ${directionText}.`;
      }
      return `${objectName} is now ${distWords}.`;
    }

    // Standard announcement phrasing:
    // e.g. "Person ahead, approximately two meters."
    if (this.settings.speakDirection && distWords) {
      return `${objectName} ${directionText}, ${distWords}.`;
    } else if (this.settings.speakDirection) {
      return `${objectName} ${directionText}.`;
    } else if (distWords) {
      return `${objectName}, ${distWords}.`;
    }

    return `${objectName}.`;
  }

  /**
   * Evaluates the top-priority detection from the current frame
   * and decides whether an audible announcement should be made.
   *
   * @param {object|null} primaryDetection - Top priority detection or null if clear
   * @param {boolean} force - Force immediate announcement (e.g. manual repeat button)
   * @returns {string|null} Spoken text if announced, otherwise null
   */
  processDetection(primaryDetection, force = false) {
    // If user has disabled voice alerts, do not announce automatically
    if (!this.settings.voiceAlertsEnabled && !force) {
      return null;
    }

    const now = Date.now();
    const timeSinceLast = now - this.lastSpokenState.timestamp;

    // Case 1: No objects detected in the current frame
    if (!primaryDetection) {
      // If we previously had an obstacle and haven't announced clear path yet
      if (this.lastSpokenState.object && !this.clearPathAnnounced && timeSinceLast >= 3000) {
        const clearMsg = 'Path clear ahead.';
        this.clearPathAnnounced = true;
        this.lastSpokenState = {
          object: null,
          position: null,
          distance: null,
          timestamp: now,
          text: clearMsg,
        };
        speechService.speak(clearMsg, false);
        return clearMsg;
      }
      return null;
    }

    this.clearPathAnnounced = false;

    const currentObj = (primaryDetection.object || '').toLowerCase();
    const currentPos = (primaryDetection.position || 'center').toLowerCase();
    const currentDist = primaryDetection.approximate_distance;

    const last = this.lastSpokenState;

    // Significant distance change detection (e.g., delta >= 0.8m or crossed 1.0m critical boundary)
    const isSameObstacle = currentObj === last.object && currentPos === last.position;
    const hasSignificantDistDelta =
      isSameObstacle &&
      currentDist !== null &&
      last.distance !== null &&
      Math.abs(currentDist - last.distance) >= 0.8;

    const isUrgentProximity = currentDist !== null && currentDist <= 1.0;
    const wasFarther = last.distance === null || last.distance > 1.3;
    const isProximityEscalation = isSameObstacle && isUrgentProximity && wasFarther;

    const isDistanceUpdate = hasSignificantDistDelta || isProximityEscalation;

    // Overall change check
    const isNewObject = currentObj !== last.object;
    const isNewPosition = currentPos !== last.position;
    const isSignificantChange = isNewObject || isNewPosition || isDistanceUpdate;

    // If forced (e.g. user voice command "Repeat" or button), speak immediately
    if (force) {
      const text = this.formatAnnouncement(primaryDetection, false);
      this.lastSpokenState = {
        object: currentObj,
        position: currentPos,
        distance: currentDist,
        timestamp: now,
        text,
      };
      speechService.speak(text, true);
      return text;
    }

    // Cooldown check: avoid repeating the same detection continuously
    if (!isDistanceUpdate && timeSinceLast < this.minCooldownMs) {
      return null;
    }

    // If scene is unchanged and repeat interval has not elapsed, suppress
    if (!isSignificantChange && timeSinceLast < this.repeatIntervalMs) {
      return null;
    }

    // Generate announcement
    const text = this.formatAnnouncement(primaryDetection, isDistanceUpdate);
    this.lastSpokenState = {
      object: currentObj,
      position: currentPos,
      distance: currentDist,
      timestamp: now,
      text,
    };

    speechService.speak(text, isProximityEscalation);

    // Haptic vibration feedback for close obstacles (< 1.2m)
    if (this.settings.vibrationEnabled && currentDist !== null && currentDist <= 1.2) {
      speechService.vibrate([200, 80, 200]);
    }

    return text;
  }
}

export const voiceManager = new VoiceManager();
export default voiceManager;
