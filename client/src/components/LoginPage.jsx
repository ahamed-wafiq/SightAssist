import { useState } from 'react';
import { loginUser } from '../services/api';

/**
 * LoginPage Component
 * 
 * Provides a clean, accessible login form connecting
 * the React frontend to Express + MongoDB (POST /api/users/login).
 *
 * Features:
 * - Email & Password validation
 * - Clear error handling (invalid credentials, missing fields, server offline)
 * - Secure JWT storage on client (localStorage)
 * - Never stores user's password
 * - Redirects to SightAssist dashboard upon success
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

    // 1. Missing fields check
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
        setSuccessMessage('Login successful! Redirecting to assistant...');
        setPassword(''); // Clear password from component memory

        // Notify parent App component with authenticated user data
        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess(result.user);
          }, 600);
        }
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage(
        'Unable to connect to the backend server. Please verify Express is running on http://localhost:5000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" role="main" aria-label="User Login Page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Account Login</h2>
          <p className="page-subtitle">Sign in to access your saved SightAssist preferences</p>
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

      {/* Main Login Card */}
      <div className="register-card">
        {/* Success Alert */}
        {successMessage && (
          <div className="register-alert register-alert--success" role="alert" aria-live="polite">
            <span className="register-alert-icon" aria-hidden="true">✅</span>
            <div className="register-alert-content">
              <strong>Success</strong>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="register-alert register-alert--error" role="alert" aria-live="assertive">
            <span className="register-alert-icon" aria-hidden="true">⚠️</span>
            <div className="register-alert-content">
              <strong>Login Failed</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="login-email" className="form-label">
              Email Address <span className="field-required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label htmlFor="login-password" className="form-label">
              Password <span className="field-required">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-submit-row">
            <button
              id="btn-login-submit"
              type="submit"
              className={`btn-primary-action btn-register-submit ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-dot" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>
        </form>

        {/* Navigation to Registration */}
        <div className="auth-switch-box">
          <span>Don't have an account yet?</span>
          <button
            type="button"
            className="btn-auth-switch"
            onClick={onGoToRegister}
          >
            Create an Account
          </button>
        </div>

        {/* Architecture Note */}
        <div className="register-info-box">
          <span className="info-icon" aria-hidden="true">🔒</span>
          <div className="info-content">
            <strong>Secure JWT Authentication:</strong>
            <p>
              Your password is encrypted with bcrypt on the server. On successful login, a JWT is issued to authenticate protected endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
