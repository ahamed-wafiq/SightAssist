import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/api';

/**
 * AccountPage Component
 * Bold Editorial / Brutalist Redesign:
 * Displays authenticated user profile from GET /api/users/me
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
    <div className="editorial-auth-wrap" role="main" aria-label="User Account Profile">
      <div className="editorial-auth-card">
        {/* Top Tag & Back */}
        <div className="auth-card-top">
          <span className="auth-kicker">AUTHENTICATED PROFILE</span>
          {onBackToAssist && (
            <button
              type="button"
              className="btn-auth-back"
              onClick={onBackToAssist}
              aria-label="Back to assistant"
            >
              ← BACK
            </button>
          )}
        </div>

        <h1 className="auth-giant-title">USER ACCOUNT</h1>
        <p className="auth-sub-desc">
          Verified SightAssist credentials and accessibility preferences.
        </p>

        {error && (
          <div className="brutalist-alert brutalist-alert--warning" role="alert">
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div className="editorial-empty-card">
            <p className="empty-editorial-title">LOADING PROFILE DATA...</p>
          </div>
        ) : profile ? (
          <div className="profile-details-editorial">
            <div className="profile-avatar-row">
              <div className="profile-glyph-box">👤</div>
              <div>
                <h2 className="profile-name-title">{profile.name}</h2>
                <span className="profile-email-badge">{profile.email}</span>
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="profile-field-block">
                <span className="field-block-label">USER ID</span>
                <span className="field-block-val">{profile.id || 'N/A'}</span>
              </div>
              <div className="profile-field-block">
                <span className="field-block-label">FULL NAME</span>
                <span className="field-block-val">{profile.name}</span>
              </div>
              <div className="profile-field-block">
                <span className="field-block-label">EMAIL ADDRESS</span>
                <span className="field-block-val">{profile.email}</span>
              </div>
              <div className="profile-field-block">
                <span className="field-block-label">STATUS</span>
                <span className="field-block-val">ACTIVE MEMBER</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-brutalist btn-brutalist--danger btn-brutalist--full"
              onClick={onLogout}
            >
              SIGN OUT OF SIGHTASSIST
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
