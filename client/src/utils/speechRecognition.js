/**
 * Browser Speech Recognition Service for SightAssist
 * ==================================================
 * Implements hands-free accessible voice commands using Web Speech API:
 * - "Start assistance"
 * - "Stop assistance"
 * - "What is ahead?"
 * - "What's on my left?"
 * - "What's on my right?"
 * - "Repeat"
 * - "Emergency"
 */

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

class SpeechCommandListener {
  constructor() {
    this.recognition = null;
    this.isSupported = Boolean(SpeechRecognition);
    this.isActive = false;
    this.onCommandCallback = null;
    this.onStateChangeCallback = null;
    this.lastCommand = null;
    this.lastTranscript = '';
    this.restartTimeout = null;

    if (this.isSupported) {
      this.initRecognition();
    }
  }

  initRecognition() {
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.notifyState({ isListening: true, error: null });
      };

      this.recognition.onresult = (event) => {
        const results = event.results;
        if (!results || results.length === 0) return;

        const latestResult = results[results.length - 1];
        if (latestResult.isFinal && latestResult[0]) {
          const transcript = latestResult[0].transcript.trim().toLowerCase();
          this.lastTranscript = transcript;
          this.handleTranscript(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        // Quiet non-critical speech errors (e.g. no-speech or aborted during stop)
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        console.warn('[VoiceCommands] Recognition error:', event.error);
        this.notifyState({ isListening: false, error: event.error });
      };

      this.recognition.onend = () => {
        this.notifyState({ isListening: false, error: null });
        // Automatically restart if user hasn't explicitly stopped listening
        if (this.isActive) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isActive) {
              try {
                this.recognition.start();
              } catch (_) {}
            }
          }, 300);
        }
      };
    } catch (err) {
      console.warn('[VoiceCommands] Could not initialize SpeechRecognition:', err.message);
      this.isSupported = false;
    }
  }

  notifyState(state = {}) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isSupported: this.isSupported,
        isActive: this.isActive,
        lastCommand: this.lastCommand,
        lastTranscript: this.lastTranscript,
        ...state,
      });
    }
  }

  /**
   * Parse spoken text into supported commands
   */
  handleTranscript(text) {
    let matchedCommand = null;

    if (
      text.includes('start assistance') ||
      text.includes('start assist') ||
      text === 'start' ||
      text.includes('begin assistance')
    ) {
      matchedCommand = 'START_ASSISTANCE';
    } else if (
      text.includes('stop assistance') ||
      text.includes('stop assist') ||
      text === 'stop' ||
      text.includes('pause assistance')
    ) {
      matchedCommand = 'STOP_ASSISTANCE';
    } else if (
      text.includes('what is ahead') ||
      text.includes("what's ahead") ||
      text.includes('what is in front') ||
      text.includes("what's in front") ||
      text === 'ahead' ||
      text === 'front'
    ) {
      matchedCommand = 'WHAT_IS_AHEAD';
    } else if (
      text.includes("what's on my left") ||
      text.includes('what is on my left') ||
      text.includes("what's on the left") ||
      text.includes('what is on the left') ||
      text.includes('what on left') ||
      text === 'left'
    ) {
      matchedCommand = 'WHAT_ON_LEFT';
    } else if (
      text.includes("what's on my right") ||
      text.includes('what is on my right') ||
      text.includes("what's on the right") ||
      text.includes('what is on the right') ||
      text.includes('what on right') ||
      text === 'right'
    ) {
      matchedCommand = 'WHAT_ON_RIGHT';
    } else if (
      text.includes('repeat') ||
      text.includes('say again') ||
      text.includes('repeat alert') ||
      text.includes('repeat that')
    ) {
      matchedCommand = 'REPEAT';
    } else if (
      text.includes('emergency') ||
      text.includes('sos') ||
      text.includes('help me') ||
      text === 'help'
    ) {
      matchedCommand = 'EMERGENCY';
    }

    if (matchedCommand) {
      this.lastCommand = matchedCommand;
      this.notifyState({ lastCommand: matchedCommand, lastTranscript: text });

      if (this.onCommandCallback) {
        this.onCommandCallback(matchedCommand, text);
      }
    }
  }

  start() {
    if (!this.isSupported || !this.recognition) return false;
    this.isActive = true;
    try {
      this.recognition.start();
      return true;
    } catch (err) {
      // If already started, ignore error
      return true;
    }
  }

  stop() {
    this.isActive = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.notifyState({ isListening: false });
  }

  toggle() {
    if (this.isActive) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }
}

export const speechCommandListener = new SpeechCommandListener();
export default speechCommandListener;
