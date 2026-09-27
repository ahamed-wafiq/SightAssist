/**
 * VoiceCommandButton Component
 * =============================
 * Prominent, tactile brutalist button for voice-command navigation.
 * 
 * Features:
 * - High contrast black & yellow brutalist design.
 * - Shows "Listening..." with pulsing indicator when active.
 * - Live accessibility announcements (aria-label, aria-live, role="status").
 * - Responsive: floats neatly above the bottom navigation on mobile,
 *   and anchors to the bottom-right corner on desktop.
 * - Shows accessible status tooltip when listening or executing commands.
 */

import React from 'react';

export default function VoiceCommandButton({
  isListening,
  onToggle,
  statusMessage,
  lastTranscript,
  isSupported = true,
}) {
  return (
    <aside
      className="voice-command-floating-container"
      aria-label="Voice Navigation Assistant"
    >
      {/* Live accessibility status readout */}
      <div
        id="voice-command-sr-status"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage || (isListening ? 'Microphone listening for command.' : '')}
      </div>

      {/* Visual status bubble when active or recent command */}
      {statusMessage && (
        <div
          className={`voice-command-status-bubble ${
            isListening ? 'voice-command-status-bubble--listening' : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {isListening && <span className="status-live-pulse" aria-hidden="true" />}
          <span className="status-bubble-text">{statusMessage}</span>
        </div>
      )}

      {/* Main Touch-Friendly Voice Command Button */}
      <button
        type="button"
        id="btn-global-voice-command"
        className={`btn-voice-command-float ${
          isListening ? 'btn-voice-command-float--listening' : ''
        } ${!isSupported ? 'btn-voice-command-float--unsupported' : ''}`}
        onClick={onToggle}
        aria-label={
          isListening
            ? 'Voice command active. Listening for a command.'
            : 'Activate voice command navigation'
        }
        aria-pressed={isListening}
        title={
          !isSupported
            ? 'Voice commands unavailable in this browser'
            : isListening
            ? 'Listening... Tap to cancel'
            : 'Tap to speak a command (e.g. "Assist", "History", "Settings")'
        }
      >
        <span className="voice-btn-icon-wrap" aria-hidden="true">
          {isListening ? (
            <span className="voice-mic-active-dot" />
          ) : (
            <span className="voice-mic-emoji">🎙️</span>
          )}
        </span>
        <span className="voice-btn-label">
          {isListening ? 'Listening...' : 'Voice Command'}
        </span>
      </button>
    </aside>
  );
}
