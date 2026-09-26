/**
 * VoiceIndicator Component
 * Polished accessibility card for voice guidance status:
 * Displays READY / LISTENING / SPEAKING / MUTED with tactile controls.
 */
export default function VoiceIndicator({
  isSpeaking,
  isAssisting,
  lastSpokenText,
  isMuted,
  onToggleMute,
  onRepeatSpeech,
}) {
  const statusLabel = isMuted
    ? 'MUTED'
    : isSpeaking
    ? 'SPEAKING'
    : isAssisting
    ? 'LISTENING'
    : 'READY';

  return (
    <section className="voice-container" aria-label="Voice Guidance Status">
      <div className="voice-card">
        {/* Top Status Row */}
        <div className="voice-card-top">
          <div className="voice-status-group">
            <span className="voice-kicker">VOICE STATUS</span>
            <div
              className={`voice-status-pill voice-status-pill--${statusLabel.toLowerCase()}`}
              role="status"
              aria-live="polite"
            >
              <span className="voice-status-dot" aria-hidden="true" />
              <span className="voice-status-text">{statusLabel}</span>
            </div>
          </div>

          <div className="voice-quick-controls">
            <button
              type="button"
              className="btn-voice-control"
              onClick={onRepeatSpeech}
              disabled={isMuted || !lastSpokenText}
              aria-label="Repeat last spoken guidance"
              title="Repeat last guidance"
            >
              <span aria-hidden="true">🔁</span> Repeat
            </button>

            <button
              type="button"
              id="btn-voice-mute"
              className={`btn-voice-control ${isMuted ? 'btn-voice-control--muted' : ''}`}
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
              title={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            >
              <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
              <span>{isMuted ? 'Unmute Voice' : 'Mute Voice'}</span>
            </button>
          </div>
        </div>

        {/* Spoken Guidance Quote */}
        <div className="voice-card-content">
          <p className="voice-spoken-text">
            {isMuted
              ? 'Voice is muted. Tap "Sound On" to resume audio guidance.'
              : lastSpokenText
              ? `"${lastSpokenText}"`
              : isAssisting
              ? 'Scanning surroundings...'
              : 'Assistance is idle.'}
          </p>
        </div>
      </div>
    </section>
  );
}
