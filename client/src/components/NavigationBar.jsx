/**
 * NavigationBar Component
 * Minimal, accessible, mobile-first navigation tabs:
 * - Assist (Camera + Live Voice Guidance)
 * - History (Detection Log)
 * - Emergency (SOS + Contacts)
 * - Settings (Accessibility Preferences)
 */

export default function NavigationBar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'assist', label: 'Assist', icon: '👁️', title: 'Live Vision Assistant' },
    { id: 'history', label: 'History', icon: '📋', title: 'Detection History' },
    { id: 'emergency', label: 'Emergency', icon: '🚨', title: 'Emergency SOS' },
    { id: 'settings', label: 'Settings', icon: '⚙️', title: 'Accessibility Settings' },
  ];

  return (
    <nav className="bottom-nav-bar" role="navigation" aria-label="Main Navigation">
      <div className="nav-tabs-grid">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab-btn ${isActive ? 'nav-tab-btn--active' : ''} ${
                tab.id === 'emergency' ? 'nav-tab-btn--emergency' : ''
              }`}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.title}
            >
              <span className="nav-tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
