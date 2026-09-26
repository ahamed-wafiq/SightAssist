import { useState } from 'react';
import speechService from '../utils/speech';

export default function SettingsPage({
  settings,
  onUpdateSettings,
  onBackToAssist,
}) {
  const [saveStatus, setSaveStatus] = useState('');

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    showSavedNote();

    if (key === 'voiceAlertsEnabled') {
      speechService.speak(
        updated.voiceAlertsEnabled ? 'Voice alerts enabled.' : 'Voice alerts disabled.',
        true
      );
    } else if (key === 'vibrationEnabled') {
      if (updated.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([150, 50, 150]);
      }
    }
  };

  const handleSelect = (key, value) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    showSavedNote();

    if (key === 'speechRate') {
      speechService.setRate(value);
      speechService.speak(`Speech speed ${value} times.`, true);
    } else if (key === 'displayMode') {
      speechService.speak(`Display mode set to ${value}.`, true);
    } else if (key === 'preferredCamera') {
      speechService.speak(
        `Preferred camera set to ${value === 'environment' ? 'back camera' : 'front camera'}.`,
        true
      );
    }
  };

  const showSavedNote = () => {
    setSaveStatus('Preferences saved to MongoDB.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="page-container" role="main" aria-label="Accessibility Settings Page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Accessibility Settings</h2>
          <p className="page-subtitle">Configure voice, camera, and tactile feedback</p>
        </div>
      </div>

      {saveStatus && (
        <div className="status-notice-banner" role="status">
          ✓ {saveStatus}
        </div>
      )}

      <div className="settings-cards-stack">
        {/* 1. Voice Alerts Master Toggle */}
        <div className="setting-card">
          <div className="setting-card-text">
            <h3 className="setting-title">Voice Alerts</h3>
            <p className="setting-desc">Enable spoken audio descriptions of detected obstacles</p>
          </div>
          <button
            type="button"
            className={`btn-toggle-switch ${settings.voiceAlertsEnabled ? 'btn-toggle-switch--on' : ''}`}
            onClick={() => handleToggle('voiceAlertsEnabled')}
            role="switch"
            aria-checked={settings.voiceAlertsEnabled}
            aria-label="Toggle voice alerts"
          >
            <span className="switch-thumb" />
            <span className="switch-text">{settings.voiceAlertsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 2. Voice Speed */}
        <div className="setting-card setting-card--stacked">
          <div className="setting-card-text">
            <h3 className="setting-title">Voice Speed</h3>
            <p className="setting-desc">Adjust speech announcement rate</p>
          </div>
          <div className="setting-button-row">
            {[0.8, 1.0, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                className={`btn-pill-option ${settings.speechRate === rate ? 'btn-pill-option--active' : ''}`}
                onClick={() => handleSelect('speechRate', rate)}
              >
                {rate}x {rate === 1.0 ? '(Normal)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Speak Distance */}
        <div className="setting-card">
          <div className="setting-card-text">
            <h3 className="setting-title">Speak Distance</h3>
            <p className="setting-desc">Include approximate distance (e.g. "~2.1 meters")</p>
          </div>
          <button
            type="button"
            className={`btn-toggle-switch ${settings.speakDistance ? 'btn-toggle-switch--on' : ''}`}
            onClick={() => handleToggle('speakDistance')}
            role="switch"
            aria-checked={settings.speakDistance}
            aria-label="Toggle speak distance"
          >
            <span className="switch-thumb" />
            <span className="switch-text">{settings.speakDistance ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 4. Speak Direction */}
        <div className="setting-card">
          <div className="setting-card-text">
            <h3 className="setting-title">Speak Direction</h3>
            <p className="setting-desc">Include spatial location (ahead, on your left, on your right)</p>
          </div>
          <button
            type="button"
            className={`btn-toggle-switch ${settings.speakDirection ? 'btn-toggle-switch--on' : ''}`}
            onClick={() => handleToggle('speakDirection')}
            role="switch"
            aria-checked={settings.speakDirection}
            aria-label="Toggle speak direction"
          >
            <span className="switch-thumb" />
            <span className="switch-text">{settings.speakDirection ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 5. Detection Confidence Threshold */}
        <div className="setting-card setting-card--stacked">
          <div className="setting-card-text">
            <h3 className="setting-title">Detection Sensitivity</h3>
            <p className="setting-desc">Minimum AI confidence filter for reporting obstacles</p>
          </div>
          <div className="setting-button-row">
            {[0.35, 0.50, 0.65].map((th) => (
              <button
                key={th}
                type="button"
                className={`btn-pill-option ${settings.confidenceThreshold === th ? 'btn-pill-option--active' : ''}`}
                onClick={() => handleSelect('confidenceThreshold', th)}
              >
                {Math.round(th * 100)}% {th === 0.50 ? '(Default)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Vibration Alerts */}
        <div className="setting-card">
          <div className="setting-card-text">
            <h3 className="setting-title">Vibration Alerts</h3>
            <p className="setting-desc">Haptic vibration pulses on mobile devices when objects are close</p>
          </div>
          <button
            type="button"
            className={`btn-toggle-switch ${settings.vibrationEnabled ? 'btn-toggle-switch--on' : ''}`}
            onClick={() => handleToggle('vibrationEnabled')}
            role="switch"
            aria-checked={settings.vibrationEnabled}
            aria-label="Toggle vibration alerts"
          >
            <span className="switch-thumb" />
            <span className="switch-text">{settings.vibrationEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 7. Camera Selection: Front / Back */}
        <div className="setting-card setting-card--stacked">
          <div className="setting-card-text">
            <h3 className="setting-title">Camera Selection</h3>
            <p className="setting-desc">Default camera lens used for real-time assistance</p>
          </div>
          <div className="setting-button-row">
            <button
              type="button"
              className={`btn-pill-option ${settings.preferredCamera === 'environment' ? 'btn-pill-option--active' : ''}`}
              onClick={() => handleSelect('preferredCamera', 'environment')}
            >
              📷 Back (Rear) Camera
            </button>
            <button
              type="button"
              className={`btn-pill-option ${settings.preferredCamera === 'user' ? 'btn-pill-option--active' : ''}`}
              onClick={() => handleSelect('preferredCamera', 'user')}
            >
              🤳 Front (Selfie) Camera
            </button>
          </div>
        </div>

        {/* 8. Display Mode: Clean Light / High Contrast */}
        <div className="setting-card setting-card--stacked">
          <div className="setting-card-text">
            <h3 className="setting-title">Display Contrast</h3>
            <p className="setting-desc">Visual contrast theme for low vision and varied lighting</p>
          </div>
          <div className="setting-button-row">
            <button
              type="button"
              className={`btn-pill-option ${settings.displayMode === 'light' ? 'btn-pill-option--active' : ''}`}
              onClick={() => handleSelect('displayMode', 'light')}
            >
              ☀️ Clean Light
            </button>
            <button
              type="button"
              className={`btn-pill-option ${settings.displayMode === 'high-contrast' ? 'btn-pill-option--active' : ''}`}
              onClick={() => handleSelect('displayMode', 'high-contrast')}
            >
              🌙 High Contrast
            </button>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="safety-notice-box">
          <span className="notice-icon" aria-hidden="true">ℹ️</span>
          <p>
            Settings are automatically synced with MongoDB and saved for future sessions.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-action btn-return-assist"
          onClick={onBackToAssist}
        >
          Return to Live Assistant
        </button>
      </div>
    </div>
  );
}
