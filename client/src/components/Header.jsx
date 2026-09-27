/**
 * Header Component
 * Bold Editorial / Modern Brutalist Desktop Top Navigation Bar:
 * - Left: SightAssist Logo / Name in punchy brutalist badge
 * - Desktop Links: Home | Assist | Detection History | Settings | Profile | Emergency
 * - Real-time AI Status Indicator
 * - Responsive: Hides desktop nav links on mobile (where bottom nav takes over)
 */
export default function Header({
  activeTab,
  onSelectTab,
  isOnline,
  currentUser,
  onLogout,
}) {
  return (
    <header className="brutalist-header" role="banner">
      <div className="header-inner">
        {/* Left: Brand Logo & Title */}
        <div
          className="header-brand"
          onClick={() => onSelectTab('home')}
          role="button"
          tabIndex={0}
          aria-label="SightAssist Home"
        >
          <div className="brand-badge-pill" aria-hidden="true">
            <span className="brand-eye-icon">👁️</span>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">SIGHTASSIST</span>
            <span className="brand-sub">AI ACCESSIBILITY</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="desktop-nav-menu" role="navigation" aria-label="Desktop Main Navigation">
          <button
            type="button"
            className={`desktop-nav-link ${activeTab === 'home' ? 'desktop-nav-link--active' : ''}`}
            onClick={() => onSelectTab('home')}
            id="nav-link-home"
          >
            Home
          </button>

          <button
            type="button"
            className={`desktop-nav-link ${activeTab === 'assist' ? 'desktop-nav-link--active' : ''}`}
            onClick={() => onSelectTab('assist')}
            id="nav-link-assist"
          >
            Assist
          </button>

          <button
            type="button"
            className={`desktop-nav-link ${activeTab === 'history' ? 'desktop-nav-link--active' : ''}`}
            onClick={() => onSelectTab('history')}
            id="nav-link-history"
          >
            Detection History
          </button>

          <button
            type="button"
            className={`desktop-nav-link ${activeTab === 'settings' ? 'desktop-nav-link--active' : ''}`}
            onClick={() => onSelectTab('settings')}
            id="nav-link-settings"
          >
            Settings
          </button>

          {/* Profile / Account or Login */}
          {currentUser ? (
            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'account' ? 'desktop-nav-link--active' : ''}`}
              onClick={() => onSelectTab('account')}
              id="nav-link-profile"
            >
              Profile ({currentUser.name.split(' ')[0]})
            </button>
          ) : (
            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'login' || activeTab === 'register' ? 'desktop-nav-link--active' : ''}`}
              onClick={() => onSelectTab('login')}
              id="nav-link-login"
            >
              Profile
            </button>
          )}

          {/* Desktop Emergency CTA */}
          <button
            type="button"
            className={`btn-nav-emergency ${activeTab === 'emergency' ? 'btn-nav-emergency--active' : ''}`}
            onClick={() => onSelectTab('emergency')}
            id="nav-link-emergency"
            aria-label="Emergency Assistance"
          >
            <span className="emergency-dot" aria-hidden="true" />
            <span>Emergency</span>
          </button>
        </nav>

        {/* Right: Status Pill & Auth Shortcuts */}
        <div className="header-right-actions">
          {/* Subtle Online / Offline Status Dot */}
          <div
            className={`header-status-pill ${isOnline ? 'header-status-pill--online' : 'header-status-pill--offline'}`}
            title={isOnline ? 'Vision Engine Active' : 'Connecting to Vision Engine'}
            role="status"
          >
            <span className="status-indicator-dot" />
            <span className="status-text">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Profile Icon & Logout Button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-header-avatar"
                onClick={() => onSelectTab('account')}
                title={`Logged in as ${currentUser.name}`}
                aria-label="Open User Profile"
              >
                👤
              </button>
              {onLogout && (
                <button
                  type="button"
                  className="btn-header-login-quick"
                  onClick={onLogout}
                  title="Sign out of account"
                  aria-label="Sign Out"
                >
                  LOGOUT
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-header-login-quick"
              onClick={() => onSelectTab('login')}
              title="Sign In"
              aria-label="Sign In"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
