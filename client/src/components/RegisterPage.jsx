import { useState } from 'react';
import { registerUser } from '../services/api';

/**
 * RegisterPage Component
 * Bold Editorial / Brutalist Redesign:
 * Heading: "CREATE YOUR ACCOUNT"
 * Warm yellow container card with black borders, clean minimal inputs.
 * Connects to Express + MongoDB (POST /api/users/register).
 */
export default function RegisterPage({ onBackToAssist, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setPassword('');
        setConfirmPassword('');

        if (onGoToLogin) {
          setTimeout(() => {
            onGoToLogin();
          }, 1200);
        }
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch {
      setErrorMessage('Backend is unavailable. Please verify server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="editorial-auth-wrap" role="main" aria-label="User Registration">
      <div className="editorial-auth-card">
        {/* Top Tag & Back */}
        <div className="auth-card-top">
          <span className="auth-kicker">NEW MEMBERSHIP</span>
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

        {/* Required Headline */}
        <h1 className="auth-giant-title">CREATE YOUR ACCOUNT</h1>
        <p className="auth-sub-desc">
          Set up your personalized profile for hands-free vision alerts and synchronized emergency contacts.
        </p>

        {/* Alerts */}
        {successMessage && (
          <div className="brutalist-alert brutalist-alert--notice" role="alert">
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="brutalist-alert brutalist-alert--warning" role="alert">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Minimal Clean Form */}
        <form onSubmit={handleSubmit} className="editorial-form" noValidate>
          <div className="editorial-form-group">
            <label htmlFor="reg-name" className="editorial-label">
              FULL NAME
            </label>
            <input
              id="reg-name"
              type="text"
              className="editorial-input"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
              required
            />
          </div>

          <div className="editorial-form-group">
            <label htmlFor="reg-email" className="editorial-label">
              EMAIL ADDRESS
            </label>
            <input
              id="reg-email"
              type="email"
              className="editorial-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="editorial-form-group">
            <label htmlFor="reg-password" className="editorial-label">
              PASSWORD (MIN 6 CHARACTERS)
            </label>
            <input
              id="reg-password"
              type="password"
              className="editorial-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="editorial-form-group">
            <label htmlFor="reg-confirm-password" className="editorial-label">
              CONFIRM PASSWORD
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              className="editorial-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            id="btn-register-submit"
            className="btn-brutalist btn-brutalist--black btn-brutalist--full"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER NOW →'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="auth-card-footer">
          <span>ALREADY HAVE AN ACCOUNT?</span>
          <button
            type="button"
            className="btn-auth-switch"
            onClick={onGoToLogin}
          >
            SIGN IN HERE
          </button>
        </div>
      </div>
    </div>
  );
}
