import { MicIcon, RefreshCwIcon, VolumeXIcon, Volume2Icon } from './Icons';

/**
 * VoiceIndicator Component
 * Prominent Voice Assistant section in bold black/yellow editorial style:
 * Title: "VOICE ASSISTANT"
 * Status: "READY TO HELP" (or "SPEAKING" / "LISTENING" / "MUTED")
 * Spoken message display (e.g. "Person ahead, slightly to your left.")
 * Tactile repeat and mute controls.
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
    : 'READY TO HELP';

  const defaultSampleQuote = isAssisting
    ? 'Scanning surroundings...'
    : 'Person ahead, slightly to your left.';

  return (
    <section className="voice-assistant-section" aria-label="Voice Assistant Status">
      <div className="voice-assistant-editorial-card">
        {/* Top Header Row: Title & Status */}
        <div className="voice-card-top-row">
          <div className="voice-title-group">
            <span className="voice-bubble-icon" aria-hidden="true">
              <MicIcon size={22} color="#000000" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="voice-main-title">VOICE ASSISTANT</h2>
              <span className="voice-sub-kicker">REAL-TIME AUDIO GUIDANCE</span>
            </div>
          </div>

          <div className="voice-status-badge-wrap">
            <div
              className={`voice-status-pill voice-status-pill--${statusLabel.toLowerCase().replace(/\s+/g, '-')}`}
              role="status"
              aria-live="polite"
            >
              <span className="voice-status-pulse-dot" aria-hidden="true" />
              <span className="voice-status-text">{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Spoken Message Banner */}
        <div className="voice-message-display">
          <span className="voice-message-label">CURRENT AUDIO FEEDBACK:</span>
          <p className="voice-spoken-quote">
            {isMuted
              ? 'Voice guidance is muted. Tap "Unmute Voice" to resume audio feedback.'
              : lastSpokenText
              ? `"${lastSpokenText}"`
              : `"${defaultSampleQuote}"`}
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="voice-card-actions">
          <button
            type="button"
            className="btn-brutalist-voice"
            onClick={onRepeatSpeech}
            disabled={isMuted || (!lastSpokenText && !isAssisting)}
            aria-label="Repeat spoken message"
          >
            <RefreshCwIcon size={16} strokeWidth={2.2} />
            <span>REPEAT GUIDANCE</span>
          </button>

          <button
            type="button"
            id="btn-voice-mute"
            className={`btn-brutalist-voice ${isMuted ? 'btn-brutalist-voice--muted' : ''}`}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
          >
            {isMuted ? (
              <VolumeXIcon size={16} strokeWidth={2.2} />
            ) : (
              <Volume2Icon size={16} strokeWidth={2.2} />
            )}
            <span>{isMuted ? 'UNMUTE VOICE' : 'MUTE VOICE'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
