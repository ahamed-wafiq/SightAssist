/**
 * Header Component
 * Clean, modern accessibility header with SightAssist title,
 * subtle connection status indicator, and accessible settings button.
 */
export default function Header({
  isOnline,
  onOpenSettings,
}) {
  return (
    <header className="app-header" role="banner">
      <div className="header-brand">
        <div className="brand-badge-icon" aria-hidden="true">
          <span>👁️</span>
        </div>
        <div className="brand-text-group">
          <h1 className="brand-title">SightAssist</h1>
          <span className="brand-subtitle">AI Camera Assistant</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Subtle Online / Offline Status Dot */}
        <div
          className={`status-indicator ${isOnline ? 'status-indicator--online' : 'status-indicator--offline'}`}
          title={isOnline ? 'AI Vision Service Connected' : 'AI Service Disconnected'}
          role="status"
          aria-label={isOnline ? 'System online' : 'System offline'}
        >
          <span className="status-dot" aria-hidden="true" />
          <span className="status-label">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Small Touch-Friendly Settings Button */}
        <button
          type="button"
          id="btn-settings-toggle"
          className="btn-settings"
          onClick={onOpenSettings}
          aria-label="Open accessibility settings"
          title="Accessibility settings"
        >
          <span aria-hidden="true" className="settings-icon">⚙️</span>
        </button>
      </div>
    </header>
  );
}
