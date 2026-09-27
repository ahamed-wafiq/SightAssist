import { useState, useEffect } from 'react';
import speechCommandListener from '../utils/speechRecognition';

/**
 * VoiceCommandsBar Component
 * Displays live speech recognition status, microphone toggle,
 * and command hints for hands-free operation.
 */
export default function VoiceCommandsBar({
  onCommandTriggered,
  isListening: externalIsListening,
  onToggle: externalOnToggle,
  lastTranscript: externalTranscript,
  statusMessage,
  isSupported: externalIsSupported,
}) {
  const [internalSupported, setInternalSupported] = useState(speechCommandListener.isSupported);
  const [internalListening, setInternalListening] = useState(speechCommandListener.isActive);
  const [lastCommand, setLastCommand] = useState('');
  const [internalTranscript, setInternalTranscript] = useState('');

  const isControlled = typeof externalOnToggle === 'function';
  const isSupported = isControlled ? externalIsSupported ?? true : internalSupported;
  const isListening = isControlled ? Boolean(externalIsListening) : internalListening;
  const lastTranscript = isControlled ? (externalTranscript || statusMessage) : internalTranscript;

  useEffect(() => {
    if (isControlled) return;

    speechCommandListener.onStateChangeCallback = (state) => {
      setInternalSupported(state.isSupported);
      setInternalListening(state.isListening);
      if (state.lastCommand) setLastCommand(state.lastCommand);
      if (state.lastTranscript) setInternalTranscript(state.lastTranscript);
    };

    speechCommandListener.onCommandCallback = (command, transcript) => {
      if (onCommandTriggered) {
        onCommandTriggered(command, transcript);
      }
    };
  }, [isControlled, onCommandTriggered]);

  const handleToggle = () => {
    if (isControlled) {
      externalOnToggle();
    } else {
      if (isListening) {
        speechCommandListener.stop();
      } else {
        speechCommandListener.start();
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-commands-strip voice-commands-strip--unsupported">
        <span className="vc-icon">🎙️</span>
        <span className="vc-text">
          Voice commands available in Chrome & Edge browsers.
        </span>
      </div>
    );
  }

  return (
    <div className={`voice-commands-strip ${isListening ? 'voice-commands-strip--active' : ''}`}>
      <div className="vc-left">
        <button
          type="button"
          className={`btn-vc-mic ${isListening ? 'btn-vc-mic--listening' : ''}`}
          onClick={handleToggle}
          aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
          title={isListening ? 'Listening for voice commands' : 'Turn on voice commands'}
        >
          <span className="vc-mic-icon" aria-hidden="true">
            {isListening ? '🎙️' : '🎤'}
          </span>
          <span className="vc-mic-label">
            {isListening ? 'Voice Commands Active' : 'Enable Voice Commands'}
          </span>
        </button>
      </div>

      <div className="vc-right">
        {lastTranscript ? (
          <span className="vc-heard-pill">
            Heard: "{lastTranscript}"
          </span>
        ) : (
          <span className="vc-hint-text">
            Try: <em>"What is ahead?"</em>, <em>"Repeat"</em>
          </span>
        )}
      </div>
    </div>
  );
}
