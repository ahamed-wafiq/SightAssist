import { HomeIcon, EyeIcon, ClipboardListIcon, SettingsIcon } from './Icons';

/**
 * NavigationBar Component
 * Fixed Mobile Bottom Navigation Bar:
 * Strictly provides:
 * Home | Assist | History | Settings
 * Tactile, touch-friendly, high contrast brutalist design.
 */
export default function NavigationBar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: <HomeIcon size={20} strokeWidth={2.2} />, title: 'SightAssist Home' },
    { id: 'assist', label: 'Assist', icon: <EyeIcon size={20} strokeWidth={2.2} />, title: 'Live Vision Assistant' },
    { id: 'history', label: 'History', icon: <ClipboardListIcon size={20} strokeWidth={2.2} />, title: 'Detection History' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} strokeWidth={2.2} />, title: 'Accessibility Settings' },
  ];

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
      <div className="mobile-nav-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-nav-btn ${isActive ? 'mobile-nav-btn--active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.title}
              id={`mob-nav-${tab.id}`}
            >
              <span className="mob-nav-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="mob-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
