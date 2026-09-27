/**
 * Header Component
 * Clean, modern accessibility header with SightAssist title,
 * subtle connection status indicator, and accessible settings button.
 */
export default function Header({
  isOnline,
  onOpenSettings,
  onOpenRegister,
  onOpenLogin,
  currentUser,
  onOpenAccount,
  onLogout,
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

        {/* Auth State Button */}
        {currentUser ? (
          <div className="header-auth-group">
            <button
              type="button"
              id="btn-header-profile"
              className="btn-header-user"
              onClick={onOpenAccount}
              aria-label={`View account profile for ${currentUser.name}`}
              title={`Logged in as ${currentUser.name}`}
            >
              👤 <span className="header-user-name">{currentUser.name.split(' ')[0]}</span>
            </button>
            <button
              type="button"
              id="btn-header-logout"
              className="btn-header-logout"
              onClick={onLogout}
              aria-label="Log out of account"
              title="Log Out"
            >
              <span aria-hidden="true" className="logout-icon">⏻</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        ) : (
          <div className="header-auth-group">
            {onOpenLogin && (
              <button
                type="button"
                id="btn-login-header-toggle"
                className="btn-settings"
                onClick={onOpenLogin}
                aria-label="Open user login"
                title="Log In"
              >
                <span aria-hidden="true" className="settings-icon">🔑</span>
              </button>
            )}
            {onOpenRegister && (
              <button
                type="button"
                id="btn-register-header-toggle"
                className="btn-settings"
                onClick={onOpenRegister}
                aria-label="Open user registration"
                title="Register"
              >
                <span aria-hidden="true" className="settings-icon">👤</span>
              </button>
            )}
          </div>
        )}

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
