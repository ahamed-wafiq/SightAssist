import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/api';

/**
 * AccountPage Component
 * 
 * Displays authenticated user details fetched directly from
 * the protected GET /api/users/me endpoint.
 *
 * Shows:
 * - id
 * - name
 * - email
 * - voiceEnabled
 * - language
 * - Logout button
 */
export default function AccountPage({ currentUser, onLogout, onBackToAssist }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [isLoading, setIsLoading] = useState(!currentUser);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      setIsLoading(true);
      const res = await getCurrentUser();
      if (res.success && res.user) {
        setProfile(res.user);
        setError('');
      } else {
        setError(res.error || 'Failed to load user profile');
      }
      setIsLoading(false);
    };

    fetchMe();
  }, []);

  return (
    <div className="page-container" role="main" aria-label="User Account Profile">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Account</h2>
          <p className="page-subtitle">Authenticated SightAssist Profile (Protected /api/users/me)</p>
        </div>
        {onBackToAssist && (
          <button
            type="button"
            className="btn-back-assist"
            onClick={onBackToAssist}
            aria-label="Back to camera assistant"
          >
            ← Back
          </button>
        )}
      </div>

      <div className="register-card">
        {error && (
          <div className="register-alert register-alert--error" role="alert">
            <span className="register-alert-icon" aria-hidden="true">⚠️</span>
            <div className="register-alert-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state-box">
            <span className="spinner-dot" aria-hidden="true" />
            <p>Loading profile from protected endpoint...</p>
          </div>
        ) : profile ? (
          <div className="profile-details-card">
            <div className="profile-header-banner">
              <span className="profile-avatar-icon" aria-hidden="true">👤</span>
              <div>
                <h3 className="profile-name">{profile.name}</h3>
                <span className="profile-email">{profile.email}</span>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="info-item-label">User ID</span>
                <code className="info-item-value">{profile.id}</code>
              </div>

              <div className="profile-info-item">
                <span className="info-item-label">Full Name</span>
                <span className="info-item-value">{profile.name}</span>
              </div>

              <div className="profile-info-item">
                <span className="info-item-label">Email Address</span>
                <span className="info-item-value">{profile.email}</span>
              </div>

              <div className="profile-info-item">
                <span className="info-item-label">Voice Guidance</span>
                <span className="info-item-value">
                  {profile.voiceEnabled ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>

              <div className="profile-info-item">
                <span className="info-item-label">Language</span>
                <span className="info-item-value">{profile.language || 'en'}</span>
              </div>
            </div>

            <div className="profile-actions-row">
              <button
                type="button"
                id="btn-logout"
                className="btn-logout-primary"
                onClick={onLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <p>No active session found. Please log in.</p>
        )}

        <div className="register-info-box">
          <span className="info-icon" aria-hidden="true">🔒</span>
          <div className="info-content">
            <strong>Security Notice:</strong>
            <p>
              This profile data is loaded from the protected Express endpoint <code>GET /api/users/me</code> using your JWT Bearer token. Passwords and password hashes are never exposed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
