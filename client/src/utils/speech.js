/**
 * Web Speech API Utility for SightAssist
 * Handles text-to-speech voice announcements with queuing and cancellation
 */

const COOLDOWN_MS = 2000;

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.onStateChange = null;
  }

  isSupported() {
    return Boolean(this.synth);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
    if (this.onStateChange) this.onStateChange({ isSpeaking: false, isMuted: this.isMuted, text: '' });
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Formats detection into the required short voice message:
   * "[Object] on your [left/center/right], [distance]."
   * Examples:
   * "Car on your left, near."
   * "Person in front, medium distance."
   */
  formatDetectionAlert(item) {
    if (!item) return '';
    const rawName = item.object || 'Obstacle';
    const objectName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const position = (item.position || 'center').toLowerCase();

    let directionStr = 'in front';
    if (position === 'left') {
      directionStr = 'on your left';
    } else if (position === 'right') {
      directionStr = 'on your right';
    } else {
      directionStr = 'in front';
    }

    let distStr = (item.distance || '').toLowerCase();
    if (distStr === 'medium') {
      distStr = 'medium distance';
    } else if (!distStr && item.approximate_distance != null) {
      distStr = `${item.approximate_distance} meters`;
    }

    if (distStr) {
      return `${objectName} ${directionStr}, ${distStr}.`;
    }
    return `${objectName} ${directionStr}.`;
  }

  /**
   * Speaks a detection alert respecting the 2-second cooldown for duplicate alerts.
   * If a new detection or different alert arrives, it speaks immediately.
   */
  speakDetection(detection, force = false) {
    if (!detection || !this.isSupported() || this.isMuted) return;

    const message = this.formatDetectionAlert(detection);
    if (!message) return;

    const now = Date.now();
    // Do not repeatedly speak the exact same detection within 2 seconds
    if (!force && message === this.lastSpokenText && now - this.lastSpokenTime < COOLDOWN_MS) {
      return;
    }

    this.speak(message, true);
  }

  /**
   * Announce an alert or detection using browser Web Speech API
   * @param {string} text - Message to speak
   * @param {boolean} force - Speak immediately canceling previous speech
   */
  speak(text, force = false) {
    if (!this.isSupported() || this.isMuted || !text) return;

    const now = Date.now();
    // 2-second cooldown before repeating the same alert
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < COOLDOWN_MS) {
      return;
    }

    try {
      // Cancel previous speech to keep announcements real-time and snappy
      if (force || this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = 'en-US';

      // Pick an English voice if available
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice = voices.find(
          (v) => (v.lang.startsWith('en') && v.name.includes('Natural')) || v.lang.startsWith('en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        if (this.onStateChange) this.onStateChange({ isSpeaking: true, text });
      };

      utterance.onend = () => {
        if (this.onStateChange) this.onStateChange({ isSpeaking: false, text: '' });
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[SpeechService] Voice notification:', e.error || e);
        }
        if (this.onStateChange) this.onStateChange({ isSpeaking: false, text: '' });
      };

      this.lastSpokenText = text;
      this.lastSpokenTime = now;
      this.synth.speak(utterance);

      // Also announce to screen reader live region
      this.announceToScreenReader(text);
    } catch (err) {
      console.warn('[SpeechService] Speech synthesis failed:', err);
    }
  }

  announceToScreenReader(text) {
    const el = document.getElementById('sr-announcements');
    if (el) {
      el.textContent = text;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.onStateChange) this.onStateChange({ isSpeaking: false, text: '' });
  }

  /**
   * Optional haptic feedback for mobile devices (when an obstacle is closer than 1m)
   */
  vibrate(pattern = [100, 50, 100]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Ignored if user hasn't interacted or permissions lack
      }
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
