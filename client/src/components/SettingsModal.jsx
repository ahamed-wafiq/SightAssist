import { useEffect, useRef } from 'react';

/**
 * SettingsModal Component
 * Accessible dialog for accessibility settings:
 * - High Contrast theme toggle
 * - Detection confidence threshold
 * - Speech rate
 */
export default function SettingsModal({
  isOpen,
  onClose,
  isHighContrast,
  onToggleTheme,
  confidenceThreshold,
  onChangeConfidenceThreshold,
  speechRate,
  onChangeSpeechRate,
}) {
  const dialogRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        <div className="modal-header">
          <h2 id="settings-dialog-title" className="modal-title">
            Accessibility Settings
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Setting 1: Theme Contrast */}
          <div className="setting-group">
            <span className="setting-label">Display Mode</span>
            <div className="setting-options-row">
              <button
                type="button"
                className={`btn-setting-pill ${!isHighContrast ? 'btn-setting-pill--active' : ''}`}
                onClick={() => {
                  if (isHighContrast) onToggleTheme();
                }}
              >
                ☀️ Clean Light
              </button>
              <button
                type="button"
                className={`btn-setting-pill ${isHighContrast ? 'btn-setting-pill--active' : ''}`}
                onClick={() => {
                  if (!isHighContrast) onToggleTheme();
                }}
              >
                🌙 High Contrast
              </button>
            </div>
          </div>

          {/* Setting 2: Speech Speed */}
          <div className="setting-group">
            <span className="setting-label">Voice Speech Rate</span>
            <div className="setting-options-row">
              {[0.8, 1.0, 1.2, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`btn-setting-pill ${speechRate === rate ? 'btn-setting-pill--active' : ''}`}
                  onClick={() => onChangeSpeechRate(rate)}
                >
                  {rate}x {rate === 1.0 ? '(Normal)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: AI Detection Sensitivity */}
          <div className="setting-group">
            <span className="setting-label">Detection Confidence Filter</span>
            <div className="setting-options-row">
              {[0.35, 0.50, 0.65].map((th) => (
                <button
                  key={th}
                  type="button"
                  className={`btn-setting-pill ${confidenceThreshold === th ? 'btn-setting-pill--active' : ''}`}
                  onClick={() => onChangeConfidenceThreshold(th)}
                >
                  {Math.round(th * 100)}% {th === 0.50 ? '(Default)' : ''}
                </button>
              ))}
            </div>
            <p className="setting-hint">
              Higher values reduce background clutter; lower values detect fainter objects.
            </p>
          </div>

          {/* Safety Notice */}
          <div className="modal-safety-notice">
            <p>
              ℹ️ <strong>SightAssist Assistive Prototype:</strong> Monocular distance estimation is approximate based on 2D camera geometry and is not guaranteed for collision safety.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-done"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
