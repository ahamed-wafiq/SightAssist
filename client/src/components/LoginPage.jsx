import { useState } from 'react';
import { loginUser } from '../services/api';
import { CheckCircleIcon, AlertTriangleIcon } from './Icons';

/**
 * LoginPage Component
 * Bold Editorial / Brutalist Redesign:
 * Heading: "WELCOME BACK"
 * Warm yellow container card with black borders, clean minimal inputs.
 * Connects to Express + MongoDB (POST /api/users/login).
 */
export default function LoginPage({ onLoginSuccess, onGoToRegister, onBackToAssist }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (result.success) {
        setSuccessMessage('Login successful! Welcome back.');
        setPassword('');

        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess(result.user);
          }, 600);
        }
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('Backend is unavailable. Please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="editorial-auth-wrap" role="main" aria-label="User Login">
      <div className="editorial-auth-card">
        {/* Top Tag & Back */}
        <div className="auth-card-top">
          <span className="auth-kicker">SIGHTASSIST ACCOUNT</span>
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
        <h1 className="auth-giant-title">WELCOME BACK</h1>
        <p className="auth-sub-desc">
          Sign in to access your calibrated accessibility profiles, saved routes, and history logs.
        </p>

        {/* Alerts */}
        {successMessage && (
          <div className="brutalist-alert brutalist-alert--notice" role="alert">
            <CheckCircleIcon size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="brutalist-alert brutalist-alert--warning" role="alert">
            <AlertTriangleIcon size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Minimal Clean Form */}
        <form onSubmit={handleSubmit} className="editorial-form" noValidate>
          <div className="editorial-form-group">
            <label htmlFor="login-email" className="editorial-label">
              EMAIL ADDRESS
            </label>
            <input
              id="login-email"
              type="email"
              className="editorial-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="editorial-form-group">
            <label htmlFor="login-password" className="editorial-label">
              PASSWORD
            </label>
            <input
              id="login-password"
              type="password"
              className="editorial-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            className="btn-brutalist btn-brutalist--black btn-brutalist--full"
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN →'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="auth-card-footer">
          <span>DON'T HAVE AN ACCOUNT?</span>
          <button
            type="button"
            className="btn-auth-switch"
            onClick={onGoToRegister}
          >
            CREATE ONE HERE
          </button>
        </div>
      </div>
    </div>
  );
}
