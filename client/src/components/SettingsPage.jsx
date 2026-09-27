import { useState } from 'react';
import speechService from '../utils/speech';

/**
 * SettingsPage Component
 * Editorial Brutalist Redesign:
 * Keep settings simple:
 * - Voice Assistant ON/OFF
 * - Language
 * - Voice Speed
 * - Vibration Alerts
 * - Emergency Contacts
 */
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
        updated.voiceAlertsEnabled ? 'Voice assistant enabled.' : 'Voice assistant disabled.',
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
      speechService.speak(`Voice speed ${value} times.`, true);
    } else if (key === 'language') {
      speechService.speak(`Language set to ${value}.`, true);
    }
  };

  const showSavedNote = () => {
    setSaveStatus('Preferences saved successfully.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="editorial-page-container" role="main" aria-label="Settings Page">
      {/* Editorial Page Header */}
      <div className="editorial-page-header">
        <div className="page-header-text">
          <span className="editorial-page-kicker">PREFERENCES & ACCESSIBILITY</span>
          <h1 className="editorial-page-title">SYSTEM SETTINGS</h1>
          <p className="editorial-page-sub">
            Customize voice parameters, feedback thresholds, and emergency routing.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="brutalist-alert brutalist-alert--notice" role="status">
          ✓ {saveStatus}
        </div>
      )}

      {/* Settings Grid / Stack */}
      <div className="editorial-settings-stack">
        {/* 1. Voice Assistant ON/OFF */}
        <div className="editorial-setting-card">
          <div className="set-card-content">
            <span className="set-card-number">01</span>
            <div>
              <h2 className="set-card-title">VOICE ASSISTANT</h2>
              <p className="set-card-desc">
                Enable spoken audio guidance and distance announcements for detected obstacles.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`btn-toggle-brutalist ${
              settings.voiceAlertsEnabled ? 'btn-toggle-brutalist--active' : ''
            }`}
            onClick={() => handleToggle('voiceAlertsEnabled')}
            role="switch"
            aria-checked={settings.voiceAlertsEnabled}
            aria-label="Toggle voice assistant"
          >
            <span className="toggle-brutalist-thumb" />
            <span className="toggle-brutalist-text">
              {settings.voiceAlertsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* 2. Language Selector */}
        <div className="editorial-setting-card editorial-setting-card--col">
          <div className="set-card-content">
            <span className="set-card-number">02</span>
            <div>
              <h2 className="set-card-title">LANGUAGE</h2>
              <p className="set-card-desc">Select spoken guidance synthesis language.</p>
            </div>
          </div>
          <div className="set-options-row">
            {[
              { code: 'en', label: 'English (US)' },
              { code: 'es', label: 'Spanish' },
              { code: 'fr', label: 'French' },
              { code: 'de', label: 'German' },
              { code: 'ja', label: 'Japanese' },
            ].map((lang) => {
              const active = (settings.language || 'en') === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`btn-pill-choice ${active ? 'btn-pill-choice--active' : ''}`}
                  onClick={() => handleSelect('language', lang.code)}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Voice Speed */}
        <div className="editorial-setting-card editorial-setting-card--col">
          <div className="set-card-content">
            <span className="set-card-number">03</span>
            <div>
              <h2 className="set-card-title">VOICE SPEED</h2>
              <p className="set-card-desc">Adjust spoken alert delivery tempo.</p>
            </div>
          </div>
          <div className="set-options-row">
            {[0.8, 1.0, 1.2, 1.5].map((rate) => {
              const active = (settings.speechRate || 1.0) === rate;
              return (
                <button
                  key={rate}
                  type="button"
                  className={`btn-pill-choice ${active ? 'btn-pill-choice--active' : ''}`}
                  onClick={() => handleSelect('speechRate', rate)}
                >
                  {rate}x {rate === 1.0 ? '(Normal)' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Vibration Alerts */}
        <div className="editorial-setting-card">
          <div className="set-card-content">
            <span className="set-card-number">04</span>
            <div>
              <h2 className="set-card-title">VIBRATION ALERTS</h2>
              <p className="set-card-desc">
                Haptic vibration pulses on mobile devices when critical obstacles approach within 1.5 meters.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`btn-toggle-brutalist ${
              settings.vibrationEnabled ? 'btn-toggle-brutalist--active' : ''
            }`}
            onClick={() => handleToggle('vibrationEnabled')}
            role="switch"
            aria-checked={settings.vibrationEnabled}
            aria-label="Toggle vibration feedback"
          >
            <span className="toggle-brutalist-thumb" />
            <span className="toggle-brutalist-text">
              {settings.vibrationEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* 5. Emergency Contacts Information */}
        <div className="editorial-setting-card">
          <div className="set-card-content">
            <span className="set-card-number">05</span>
            <div>
              <h2 className="set-card-title">EMERGENCY CONTACTS</h2>
              <p className="set-card-desc">
                Designate primary guardians or emergency services to receive instant SOS coordinates.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-brutalist btn-brutalist--yellow btn-brutalist--sm"
            onClick={() => {
              window.location.hash = '#emergency';
              if (onBackToAssist) onBackToAssist();
            }}
          >
            MANAGE SOS
          </button>
        </div>
      </div>
    </div>
  );
}
