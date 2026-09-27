/**
 * useVoiceCommands Hook
 * =====================
 * Hands-free Voice-Command Navigation and Control for SightAssist
 * 
 * Powered by browser Web Speech API:
 * - SpeechRecognition / webkitSpeechRecognition for single-command voice input
 * - speechSynthesis via speechService for accessible voice confirmation
 * 
 * Commands Supported:
 * - "home" / "go home"                     -> navigate("/")
 * - "assist" / "open assist" / "start assist" -> navigate("/assist")
 * - "history" / "open history"             -> navigate("/history")
 * - "settings" / "open settings"           -> navigate("/settings")
 * - "emergency"                            -> navigate("/emergency")
 * - "go back" / "back"                     -> navigate(-1)
 * - "start detection"                      -> trigger existing detection start
 * - "stop detection"                       -> trigger existing detection stop
 * - "enable voice" / "voice on"            -> enable existing voice output
 * - "mute voice" / "voice off"             -> disable existing voice output
 * - "what page am I on?"                   -> speak current page name
 * - "stop listening"                       -> stop voice recognition
 * - Unknown commands                       -> "Sorry, I didn't understand that command."
 * 
 * Safeguards:
 * - Listens for strictly ONE command, then stops immediately.
 * - Cancels speech synthesis before opening mic so it never hears itself.
 * - Does not keep microphone continuously active.
 * - Safe fallback if SpeechRecognition is unsupported.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import speechService from '../utils/speech';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const PAGE_NAMES = {
  home: 'Home',
  assist: 'Assist',
  history: 'History',
  settings: 'Settings',
  emergency: 'Emergency SOS',
  login: 'Sign In',
  register: 'Register',
  account: 'Profile Account',
};

export function useVoiceCommands({
  activeTab = 'home',
  navigate,
  startDetection,
  stopDetection,
  enableVoice,
  disableVoice,
  isMuted = false,
  isAssisting = false,
  onCommandExecuted,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSupported] = useState(Boolean(SpeechRecognition));

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const messageTimerRef = useRef(null);
  const isExecutingRef = useRef(false);

  // Keep latest refs to avoid stale closures in recognition callbacks
  const activeTabRef = useRef(activeTab);
  const navigateRef = useRef(navigate);
  const startDetectionRef = useRef(startDetection);
  const stopDetectionRef = useRef(stopDetection);
  const enableVoiceRef = useRef(enableVoice);
  const disableVoiceRef = useRef(disableVoice);
  const onCommandExecutedRef = useRef(onCommandExecuted);

  useEffect(() => {
    activeTabRef.current = activeTab;
    navigateRef.current = navigate;
    startDetectionRef.current = startDetection;
    stopDetectionRef.current = stopDetection;
    enableVoiceRef.current = enableVoice;
    disableVoiceRef.current = disableVoice;
    onCommandExecutedRef.current = onCommandExecuted;
  });

  const showStatus = useCallback((msg, durationMs = 4000) => {
    setStatusMessage(msg);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    if (durationMs > 0) {
      messageTimerRef.current = setTimeout(() => {
        setStatusMessage('');
      }, durationMs);
    }
  }, []);

  /**
   * Speak confirmation using speechSynthesis.
   * Ensures recognition is completely terminated beforehand so the speech output
   * is NEVER heard by the microphone as a new command.
   */
  const speakConfirmation = useCallback((text) => {
    // Explicitly cancel and abort recognition before speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    setIsListening(false);
    speechService.speak(text, true);
  }, []);

  /**
   * Match spoken transcript to one of the required commands and execute action
   */
  const processCommand = useCallback(
    (rawTranscript) => {
      if (!rawTranscript) return;

      const text = rawTranscript
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, '');

      setLastTranscript(text);
      console.log('[useVoiceCommands] Received transcript:', text);

      // 1. "home" / "go home" -> navigate("/")
      if (
        text === 'home' ||
        text === 'go home' ||
        text === 'open home' ||
        text === 'take me home' ||
        text === 'navigate to home'
      ) {
        showStatus('Navigating to Home...');
        speakConfirmation('Navigating to Home.');
        if (navigateRef.current) navigateRef.current('/');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('HOME', text);
        return;
      }

      // 2. "assist" / "open assist" / "start assist" -> navigate("/assist")
      if (
        text === 'assist' ||
        text === 'open assist' ||
        text === 'start assist' ||
        text === 'go to assist' ||
        text === 'navigate to assist' ||
        text === 'vision assist'
      ) {
        showStatus('Opening Assist...');
        speakConfirmation('Opening Assist.');
        if (navigateRef.current) navigateRef.current('/assist');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('ASSIST', text);
        return;
      }

      // 3. "history" / "open history" -> navigate("/history")
      if (
        text === 'history' ||
        text === 'open history' ||
        text === 'go to history' ||
        text === 'detection history' ||
        text === 'view history'
      ) {
        showStatus('Opening Detection History...');
        speakConfirmation('Opening History.');
        if (navigateRef.current) navigateRef.current('/history');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('HISTORY', text);
        return;
      }

      // 4. "settings" / "open settings" -> navigate("/settings")
      if (
        text === 'settings' ||
        text === 'open settings' ||
        text === 'go to settings' ||
        text === 'accessibility settings'
      ) {
        showStatus('Opening Settings...');
        speakConfirmation('Opening Settings.');
        if (navigateRef.current) navigateRef.current('/settings');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('SETTINGS', text);
        return;
      }

      // 5. "emergency" -> navigate("/emergency")
      if (
        text === 'emergency' ||
        text === 'open emergency' ||
        text === 'sos' ||
        text === 'help' ||
        text === 'emergency contacts'
      ) {
        showStatus('Opening Emergency SOS...');
        speakConfirmation('Opening Emergency.');
        if (navigateRef.current) navigateRef.current('/emergency');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('EMERGENCY', text);
        return;
      }

      // 6. "go back" / "back" -> navigate(-1)
      if (
        text === 'go back' ||
        text === 'back' ||
        text === 'previous' ||
        text === 'previous page' ||
        text === 'return'
      ) {
        showStatus('Going back...');
        speakConfirmation('Going back.');
        if (navigateRef.current) navigateRef.current(-1);
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('GO_BACK', text);
        return;
      }

      // 7. "start detection" -> trigger existing detection start
      if (
        text === 'start detection' ||
        text === 'start detecting' ||
        text === 'begin detection' ||
        text === 'start camera' ||
        text === 'start assistance'
      ) {
        showStatus('Starting detection...');
        speakConfirmation('Starting obstacle detection.');
        if (startDetectionRef.current) startDetectionRef.current();
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('START_DETECTION', text);
        return;
      }

      // 8. "stop detection" -> trigger existing detection stop
      if (
        text === 'stop detection' ||
        text === 'stop detecting' ||
        text === 'end detection' ||
        text === 'stop camera' ||
        text === 'stop assistance'
      ) {
        showStatus('Stopping detection...');
        speakConfirmation('Stopping obstacle detection.');
        if (stopDetectionRef.current) stopDetectionRef.current();
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('STOP_DETECTION', text);
        return;
      }

      // 9. "enable voice" / "voice on" -> enable existing voice output
      if (
        text === 'enable voice' ||
        text === 'voice on' ||
        text === 'unmute' ||
        text === 'unmute voice' ||
        text === 'turn on voice' ||
        text === 'sound on'
      ) {
        showStatus('Voice output enabled.');
        if (enableVoiceRef.current) enableVoiceRef.current();
        speakConfirmation('Voice output enabled.');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('ENABLE_VOICE', text);
        return;
      }

      // 10. "mute voice" / "voice off" -> disable existing voice output
      if (
        text === 'mute voice' ||
        text === 'voice off' ||
        text === 'mute' ||
        text === 'turn off voice' ||
        text === 'disable voice' ||
        text === 'sound off'
      ) {
        showStatus('Voice output muted.');
        if (disableVoiceRef.current) disableVoiceRef.current();
        // Give short confirmation before muting
        speakConfirmation('Voice output muted.');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('MUTE_VOICE', text);
        return;
      }

      // 11. "what page am I on?" -> speak current page
      if (
        text.includes('what page am i on') ||
        text.includes('what page is this') ||
        text === 'where am i' ||
        text.includes('current page') ||
        text === 'page'
      ) {
        const pageName = PAGE_NAMES[activeTabRef.current] || activeTabRef.current;
        const msg = `You are on the ${pageName} page.`;
        showStatus(msg);
        speakConfirmation(msg);
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('WHAT_PAGE', text);
        return;
      }

      // 12. "stop listening" -> stop voice recognition
      if (
        text === 'stop listening' ||
        text === 'cancel' ||
        text === 'stop mic' ||
        text === 'never mind' ||
        text === 'dismiss'
      ) {
        showStatus('Stopped listening.');
        speakConfirmation('Stopped listening.');
        if (onCommandExecutedRef.current) onCommandExecutedRef.current('STOP_LISTENING', text);
        return;
      }

      // 13. Unknown command
      const fallbackMsg = "Sorry, I didn't understand that command.";
      showStatus(`Unrecognized: "${text}". Try: Home, Assist, History, Settings, Emergency.`);
      speakConfirmation(fallbackMsg);
      if (onCommandExecutedRef.current) onCommandExecutedRef.current('UNKNOWN', text);
    },
    [showStatus, speakConfirmation]
  );

  /**
   * Stop recognition manually or on timeout
   */
  const stopListening = useCallback(() => {
    setIsListening(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
  }, []);

  /**
   * Start listening for ONE voice command.
   * Cancels any currently playing text-to-speech to prevent speech synthesis feedback.
   */
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      const unsupportedMsg = 'Voice recognition is not supported in this browser. Please use Chrome or Edge.';
      showStatus(unsupportedMsg);
      speechService.speak('Voice recognition is not supported in this browser.', true);
      return false;
    }

    // Stop any speech synthesizer immediately so recognition doesn't hear the assistant
    speechService.stop();

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Strictly listen for ONE command
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      isExecutingRef.current = false;

      recognition.onstart = () => {
        setIsListening(true);
        showStatus('Listening for command...', 0);
      };

      recognition.onresult = (event) => {
        const results = event.results;
        if (!results || results.length === 0) return;

        const result = results[0];
        if (result && result[0]) {
          const transcript = result[0].transcript;
          isExecutingRef.current = true;

          // Stop recognition immediately upon receiving the single command
          try {
            recognition.stop();
          } catch (_) {}
          setIsListening(false);

          processCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') return;

        setIsListening(false);
        if (event.error === 'no-speech') {
          showStatus('No command detected. Tap the mic to try again.');
        } else if (event.error === 'not-allowed') {
          showStatus('Microphone permission denied. Please allow microphone access.');
          speechService.speak('Microphone access was denied.', true);
        } else {
          console.warn('[useVoiceCommands] Recognition error:', event.error);
          showStatus(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Timeout safety: automatically stop if nothing heard after 8 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!isExecutingRef.current) {
          stopListening();
          showStatus('Listening timed out. Tap mic to retry.');
        }
      }, 8000);

      return true;
    } catch (err) {
      console.warn('[useVoiceCommands] Could not start recognition:', err);
      setIsListening(false);
      showStatus('Could not activate microphone.');
      return false;
    }
  }, [processCommand, showStatus, stopListening]);

  /**
   * Toggle listening state
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      showStatus('Listening cancelled.');
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening, showStatus]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    lastTranscript,
    statusMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}

export default useVoiceCommands;
