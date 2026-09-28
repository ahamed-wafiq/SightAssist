import { useState, useEffect, useRef, useCallback } from 'react';
import HomePage from './components/HomePage';
import Header from './components/Header';
import AssistanceControls from './components/AssistanceControls';
import CameraView from './components/CameraView';
import VoiceIndicator from './components/VoiceIndicator';
import DetectionPanel from './components/DetectionPanel';
import VoiceCommandsBar from './components/VoiceCommandsBar';
import VoiceCommandButton from './components/VoiceCommandButton';
import NavigationBar from './components/NavigationBar';
import HistoryPage from './components/HistoryPage';
import EmergencyPage from './components/EmergencyPage';
import SettingsPage from './components/SettingsPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import useVoiceCommands from './hooks/useVoiceCommands';
import speechService from './utils/speech';
import voiceManager from './utils/voiceManager';
import {
  filterDetections,
  selectPrimaryDetection,
  DEFAULT_CONFIDENCE_THRESHOLD,
} from './utils/detectionPriority';
import { predictFrame, checkMLServiceHealth } from './services/mlService';
import {
  getStoredSettings,
  saveStoredSettings,
  getCurrentUser,
  logoutUser,
  getAuthToken,
  checkBackendHealth,
} from './services/api';
import './App.css';

// Controlled detection interval (1 frame every 1 second)
const DETECTION_INTERVAL_MS = 1000;

const DEFAULT_SETTINGS = {
  voiceAlertsEnabled: true,
  speechRate: 1.0,
  speakDistance: true,
  speakDirection: true,
  confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
  vibrationEnabled: true,
  displayMode: 'light',
  preferredCamera: 'environment',
  emergencyContacts: [],
};

function App() {
  // Navigation State ('home' | 'assist' | 'history' | 'emergency' | 'settings' | 'register' | 'login' | 'account')
  const [activeTab, setActiveTab] = useState('home');

  // Authenticated User State (JWT in localStorage)
  const [currentUser, setCurrentUser] = useState(null);

  // User Settings State (persisted in MongoDB)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Assistance & Camera States
  const [isAssisting, setIsAssisting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Service connection statuses
  const [backendConnected, setBackendConnected] = useState(false);
  const [mlStatus, setMlStatus] = useState({ online: false });

  // Real-time Detection States
  const [detections, setDetections] = useState([]);
  const [primaryDetection, setPrimaryDetection] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState(null);

  // Voice speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Component & Loop Refs to guarantee safe lifecycle management
  const cameraRef = useRef(null);
  const isAssistingRef = useRef(false);
  const isCameraActiveRef = useRef(false);
  const inFlightRef = useRef(false);
  const loopTimerRef = useRef(null);
  const settingsRef = useRef(settings);
  const detectionsRef = useRef(detections);
  const primaryDetectionRef = useRef(primaryDetection);

  // Keep refs synchronized
  useEffect(() => {
    isCameraActiveRef.current = isCameraActive;
  }, [isCameraActive]);

  useEffect(() => {
    isAssistingRef.current = isAssisting;
  }, [isAssisting]);

  useEffect(() => {
    settingsRef.current = settings;
    voiceManager.setSettings(settings);
  }, [settings]);

  useEffect(() => {
    detectionsRef.current = detections;
    primaryDetectionRef.current = primaryDetection;
  }, [detections, primaryDetection]);

  // Load Authenticated User Profile via JWT on mount
  useEffect(() => {
    const verifyUserSession = async () => {
      const token = getAuthToken();
      if (token) {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setCurrentUser(result.user);
        } else {
          setCurrentUser(null);
        }
      }
    };
    verifyUserSession();
  }, []);

  // Load User Settings from MongoDB on mount
  useEffect(() => {
    const initSettings = async () => {
      const stored = await getStoredSettings();
      if (stored) {
        setSettings((prev) => ({ ...prev, ...stored }));
        voiceManager.setSettings(stored);
      }
    };
    initSettings();
  }, []);

  // Sync High Contrast Theme class on document.body
  useEffect(() => {
    if (settings.displayMode === 'high-contrast') {
      document.body.classList.add('theme-high-contrast');
    } else {
      document.body.classList.remove('theme-high-contrast');
    }
  }, [settings.displayMode]);

  // Subscribe to speech service state changes
  useEffect(() => {
    speechService.onStateChange = ({ isSpeaking, text }) => {
      setIsSpeaking(isSpeaking);
      if (text) setLastSpokenText(text);
    };
  }, []);

  // Poll Express Backend health status
  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await checkBackendHealth();
      setBackendConnected(isOnline);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll Python FastAPI ML Service (/health)
  useEffect(() => {
    const checkML = async () => {
      const status = await checkMLServiceHealth();
      setMlStatus(status);
    };

    checkML();
    const interval = setInterval(checkML, 8000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Continuous Detection Loop Step
   * Captures in-memory camera frame via hidden canvas, sends to FastAPI YOLO microservice,
   * extracts detections (object, confidence, position, approximate distance), and updates React state.
   * Frame rate: 1 frame every 1 second (1000ms).
   */
  const executeDetectionStep = useCallback(async () => {
    if (!isCameraActiveRef.current && !isAssistingRef.current) return;

    if (inFlightRef.current) {
      loopTimerRef.current = setTimeout(executeDetectionStep, 200);
      return;
    }

    if (!cameraRef.current) {
      loopTimerRef.current = setTimeout(executeDetectionStep, 300);
      return;
    }

    inFlightRef.current = true;
    setIsDetecting(true);

    try {
      // 1. Capture camera frame as in-memory JPEG Blob via hidden canvas
      const frameBlob = await cameraRef.current.captureFrameBlob();

      if (!isCameraActiveRef.current && !isAssistingRef.current) return;

      // 2. Dispatch to FastAPI POST /detect via mlService
      const result = await predictFrame(frameBlob);

      if (!isCameraActiveRef.current && !isAssistingRef.current) return;

      // 3. Process detections (object name, confidence >= 0.40, position, distance)
      const rawDetections = result.detections || [];
      const currentThreshold = settingsRef.current.confidenceThreshold || DEFAULT_CONFIDENCE_THRESHOLD;
      const filtered = filterDetections(rawDetections, {
        minConfidence: currentThreshold,
      });

      // 4. Select primary detected obstacle
      const primary = selectPrimaryDetection(filtered);

      setDetections(filtered);
      setPrimaryDetection(primary);
      setDetectionError(null);

      // 5. Voice alert for the closest / most prominent obstacle (2s cooldown on repeats)
      if (primary && !isMuted) {
        speechService.speakDetection(primary);
      }
    } catch (err) {
      if (!isCameraActiveRef.current && !isAssistingRef.current) return;

      const message = err.message || '';
      if (message.includes('CAMERA_WARMING_UP') || message.includes('initializing')) {
        return;
      }

      if (
        message.includes('Python ML service is unavailable') ||
        message.includes('ML API service is unavailable') ||
        message.includes('Failed to fetch') ||
        message.includes('NetworkError')
      ) {
        setDetectionError('ML API service is unavailable. Please check the ML service status.');
      } else {
        setDetectionError(message);
      }
    } finally {
      inFlightRef.current = false;
      setIsDetecting(false);

      if (isCameraActiveRef.current || isAssistingRef.current) {
        loopTimerRef.current = setTimeout(executeDetectionStep, DETECTION_INTERVAL_MS);
      }
    }
  }, [isMuted]);

  /**
   * Start Camera:
   * Turns on live camera feed and begins 1-second detection loop
   */
  const startCamera = useCallback(() => {
    setIsCameraActive(true);
    isCameraActiveRef.current = true;
    setCameraError(null);
    setDetectionError(null);

    clearTimeout(loopTimerRef.current);
    // Allow short interval for video stream to negotiate dimensions
    loopTimerRef.current = setTimeout(executeDetectionStep, 800);
  }, [executeDetectionStep]);

  /**
   * Stop Camera:
   * Stops video stream, clears timer, stops speech, and resets detections
   */
  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    isCameraActiveRef.current = false;
    setIsAssisting(false);
    isAssistingRef.current = false;

    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }

    speechService.stop();
    setDetections([]);
    setPrimaryDetection(null);
    setIsDetecting(false);
  }, []);

  /**
   * Start Assistance:
   * Activates assistance state and turns on camera detection
   */
  const startAssistance = useCallback(() => {
    if (isAssistingRef.current) return;
    isAssistingRef.current = true;
    setIsAssisting(true);
    setActiveTab('assist');
    startCamera();
  }, [startCamera]);

  /**
   * Stop Assistance:
   * Stops camera and detection loop
   */
  const stopAssistance = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  const handleCameraError = useCallback((err) => {
    setCameraError(err || 'Camera unavailable');
    stopCamera();
  }, [stopCamera]);

  const handleToggleAssistance = () => {
    if (!isAssisting) {
      startAssistance();
    } else {
      stopAssistance();
    }
  };

  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Navigation History Stack for "go back" / navigate(-1) voice command
  const historyStackRef = useRef(['home']);

  const navigate = useCallback((target) => {
    if (target === -1 || target === '-1') {
      if (historyStackRef.current.length > 1) {
        historyStackRef.current.pop();
        const prev = historyStackRef.current[historyStackRef.current.length - 1];
        setActiveTab(prev);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return prev;
      } else {
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return 'home';
      }
    }

    let tab = target;
    if (typeof target === 'string') {
      const clean = target.replace(/^\//, '').toLowerCase();
      if (clean === '' || clean === 'home') tab = 'home';
      else if (clean === 'assist') tab = 'assist';
      else if (clean === 'history') tab = 'history';
      else if (clean === 'settings') tab = 'settings';
      else if (clean === 'emergency') tab = 'emergency';
      else if (clean === 'login') tab = 'login';
      else if (clean === 'register') tab = 'register';
      else if (clean === 'account' || clean === 'profile') tab = 'account';
    }

    if (historyStackRef.current[historyStackRef.current.length - 1] !== tab) {
      historyStackRef.current.push(tab);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return tab;
  }, []);

  const enableVoice = useCallback(() => {
    setIsMuted(false);
    speechService.setMuted(false);
  }, []);

  const disableVoice = useCallback(() => {
    setIsMuted(true);
    speechService.setMuted(true);
  }, []);

  // Global Hands-free Voice Commands Hook for Navigation & System Control
  const {
    isListening: isVoiceCommandListening,
    isSupported: isVoiceCommandSupported,
    lastTranscript: voiceCommandTranscript,
    statusMessage: voiceCommandStatus,
    toggleListening: handleToggleVoiceCommand,
  } = useVoiceCommands({
    activeTab,
    navigate,
    startDetection: startAssistance,
    stopDetection: stopAssistance,
    enableVoice,
    disableVoice,
    isMuted,
    isAssisting,
  });

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
    if (!nextMuted) {
      speechService.speak('Voice alerts enabled.', true);
    }
  };

  const handleRepeatSpeech = () => {
    if (primaryDetection) {
      voiceManager.processDetection(primaryDetection, true);
    } else if (lastSpokenText) {
      speechService.speak(lastSpokenText, true);
    } else {
      speechService.speak('Path clear ahead.', true);
    }
  };

  /**
   * Handle Voice Commands (Web Speech API)
   * Connects spoken commands directly to React detection & application state
   */
  const handleVoiceCommand = useCallback((command) => {
    console.log('[App] Voice Command received:', command);

    switch (command) {
      case 'START_ASSISTANCE':
        startAssistance();
        break;

      case 'STOP_ASSISTANCE':
        stopAssistance();
        break;

      case 'WHAT_IS_AHEAD': {
        const centerItem =
          detectionsRef.current.find(
            (d) => (d.position || '').toLowerCase() === 'center'
          ) || primaryDetectionRef.current;

        if (centerItem) {
          const distStr =
            centerItem.approximate_distance != null
              ? `, approximately ${centerItem.approximate_distance} meters`
              : '';
          speechService.speak(
            `${centerItem.object} ahead${distStr}.`,
            true
          );
        } else {
          speechService.speak('Path is clear ahead.', true);
        }
        break;
      }

      case 'WHAT_ON_LEFT': {
        const leftItem = detectionsRef.current.find(
          (d) => (d.position || '').toLowerCase() === 'left'
        );

        if (leftItem) {
          const distStr =
            leftItem.approximate_distance != null
              ? `, approximately ${leftItem.approximate_distance} meters`
              : '';
          speechService.speak(
            `${leftItem.object} on your left${distStr}.`,
            true
          );
        } else {
          speechService.speak('Nothing detected on your left.', true);
        }
        break;
      }

      case 'WHAT_ON_RIGHT': {
        const rightItem = detectionsRef.current.find(
          (d) => (d.position || '').toLowerCase() === 'right'
        );

        if (rightItem) {
          const distStr =
            rightItem.approximate_distance != null
              ? `, approximately ${rightItem.approximate_distance} meters`
              : '';
          speechService.speak(
            `${rightItem.object} on your right${distStr}.`,
            true
          );
        } else {
          speechService.speak('Nothing detected on your right.', true);
        }
        break;
      }

      case 'REPEAT':
        handleRepeatSpeech();
        break;

      case 'EMERGENCY':
        navigate('/emergency');
        speechService.speak(
          'Emergency SOS screen opened. Tap the large button to broadcast an alert.',
          true
        );
        break;

      default:
        break;
    }
  }, [navigate, startAssistance, stopAssistance]);

  // Update Settings handler (persists to MongoDB)
  const handleUpdateSettings = async (newSettings) => {
    setSettings(newSettings);
    voiceManager.setSettings(newSettings);
    await saveStoredSettings(newSettings);
  };

  // Authentication handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Redirect directly to SightAssist dashboard
    navigate('/assist');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/login');
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      isAssistingRef.current = false;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      voiceManager.reset();
    };
  }, []);

  return (
    <div className="app-shell">
      {/* 1. Desktop Top Header: Logo, Nav Links (Home, Assist, History, Settings, Profile, Emergency), Status Dot */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => navigate(tab)}
        isOnline={mlStatus.online || backendConnected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Content View according to activeTab */}
      {activeTab === 'home' && (
        <HomePage
          onStartAssist={startAssistance}
          onOpenEmergency={() => navigate('/emergency')}
        />
      )}

      {activeTab === 'assist' && (
        <main className="assist-view" role="main">
          {/* Assist Header */}
          <div className="assist-view-heading-wrap">
            <span className="assist-view-kicker">REAL-TIME YOLO VISION</span>
            <h1 className="assist-view-title">ASSIST LIVE</h1>
          </div>

          {/* Live Camera View with Real-time Bounding Boxes & Direction Strip */}
          <CameraView
            ref={cameraRef}
            isCameraActive={isCameraActive}
            onToggleCamera={handleToggleCamera}
            isAssistanceActive={isAssisting}
            detections={detections}
            primaryDetection={primaryDetection}
            preferredCamera={settings.preferredCamera}
            onCameraError={handleCameraError}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Prominent Current Obstacle Card + Secondary Detections */}
          <DetectionPanel
            detections={detections}
            primaryDetection={primaryDetection}
            isAssisting={isAssisting}
            detectionError={detectionError || cameraError}
          />

          {/* Voice Guidance Status: READY TO HELP / LISTENING / SPEAKING / MUTED */}
          <VoiceIndicator
            isSpeaking={isSpeaking}
            isAssisting={isAssisting}
            lastSpokenText={lastSpokenText}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onRepeatSpeech={handleRepeatSpeech}
          />

          {/* Hands-Free Voice Commands Bar */}
          <VoiceCommandsBar
            onCommandTriggered={handleVoiceCommand}
            isListening={isVoiceCommandListening}
            onToggle={handleToggleVoiceCommand}
            lastTranscript={voiceCommandTranscript}
            statusMessage={voiceCommandStatus}
            isSupported={isVoiceCommandSupported}
          />

          {/* Primary Action Button: START DETECTION / STOP DETECTION */}
          <AssistanceControls
            isAssisting={isAssisting}
            onToggleAssistance={handleToggleAssistance}
          />
        </main>
      )}

      {activeTab === 'history' && (
        <HistoryPage onBackToAssist={() => navigate('/assist')} />
      )}

      {activeTab === 'emergency' && (
        <EmergencyPage />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBackToAssist={() => navigate('/assist')}
        />
      )}

      {activeTab === 'register' && (
        <RegisterPage
          onBackToAssist={() => navigate('/assist')}
          onGoToLogin={() => navigate('/login')}
        />
      )}

      {activeTab === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => navigate('/register')}
          onBackToAssist={() => navigate('/assist')}
        />
      )}

      {activeTab === 'account' && (
        <AccountPage
          currentUser={currentUser}
          onLogout={handleLogout}
          onBackToAssist={() => navigate('/assist')}
        />
      )}

      {/* 3. Global Hands-free Voice Navigation Button */}
      <VoiceCommandButton
        isListening={isVoiceCommandListening}
        onToggle={handleToggleVoiceCommand}
        statusMessage={voiceCommandStatus}
        lastTranscript={voiceCommandTranscript}
        isSupported={isVoiceCommandSupported}
      />

      {/* 4. Mobile Fixed Bottom Navigation Bar (Home | Assist | History | Settings) */}
      <NavigationBar
        activeTab={activeTab}
        onSelectTab={(tab) => navigate(tab)}
      />
    </div>
  );
}

export default App;
