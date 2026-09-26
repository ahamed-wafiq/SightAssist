import { useState, useEffect } from 'react';
import speechCommandListener from '../utils/speechRecognition';

/**
 * VoiceCommandsBar Component
 * Displays live speech recognition status, microphone toggle,
 * and command hints for hands-free operation.
 */
export default function VoiceCommandsBar({ onCommandTriggered }) {
  const [isSupported, setIsSupported] = useState(speechCommandListener.isSupported);
  const [isListening, setIsListening] = useState(speechCommandListener.isActive);
  const [lastCommand, setLastCommand] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');

  useEffect(() => {
    speechCommandListener.onStateChangeCallback = (state) => {
      setIsSupported(state.isSupported);
      setIsListening(state.isListening);
      if (state.lastCommand) setLastCommand(state.lastCommand);
      if (state.lastTranscript) setLastTranscript(state.lastTranscript);
    };

    speechCommandListener.onCommandCallback = (command, transcript) => {
      if (onCommandTriggered) {
        onCommandTriggered(command, transcript);
      }
    };
  }, [onCommandTriggered]);

  const handleToggle = () => {
    if (isListening) {
      speechCommandListener.stop();
    } else {
      speechCommandListener.start();
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
