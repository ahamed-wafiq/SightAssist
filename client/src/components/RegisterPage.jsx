import { useState } from 'react';
import { registerUser } from '../services/api';

/**
 * RegisterPage Component
 * 
 * Provides a clean, accessible registration form that connects
 * the React frontend to the Express backend (POST /api/users/register).
 *
 * Handles:
 * - Successful registration
 * - Duplicate email error from MongoDB
 * - Missing fields validation
 * - Backend server unavailable (network error)
 * - Invalid server response format
 */
export default function RegisterPage({ onBackToAssist, onGoToLogin }) {
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset feedback messages
    setErrorMessage('');
    setSuccessMessage('');
    setRegisteredUser(null);

    // 1. Client-side validation for missing fields
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 2. Submit to backend
    setIsLoading(true);

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        // Successful registration
        setSuccessMessage(result.message || 'User registered successfully!');
        setRegisteredUser(result.user || { name: name.trim(), email: email.trim() });

        // Clear sensitive fields - never store passwords
        setPassword('');
        setName('');
        setEmail('');
      } else {
        // Backend validation, duplicate email, backend unavailable, or invalid response
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      // General safety fallback
      setErrorMessage(
        'Unable to connect to the backend server. Please verify Express is running on http://localhost:5000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" role="main" aria-label="User Registration Page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">User Registration</h2>
          <p className="page-subtitle">Connect your account to the SightAssist backend</p>
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

      {/* Main Registration Card */}
      <div className="register-card">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="register-alert register-alert--success" role="alert" aria-live="polite">
            <span className="register-alert-icon" aria-hidden="true">✅</span>
            <div className="register-alert-content">
              <strong>Registration Successful!</strong>
              <p>{successMessage}</p>
              {registeredUser && (
                <div className="registered-user-summary">
                  <p>Welcome, <strong>{registeredUser.name}</strong> ({registeredUser.email})</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="register-alert register-alert--error" role="alert" aria-live="assertive">
            <span className="register-alert-icon" aria-hidden="true">⚠️</span>
            <div className="register-alert-content">
              <strong>Registration Error</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-field">
            <label htmlFor="reg-name" className="form-label">
              Full Name <span className="field-required">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="name"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="reg-email" className="form-label">
              Email Address <span className="field-required">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="e.g. jane@example.com"
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
            <label htmlFor="reg-password" className="form-label">
              Password <span className="field-required">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            <small className="field-hint">Must be at least 6 characters long.</small>
          </div>

          {/* Submit Button */}
          <div className="form-submit-row">
            <button
              id="btn-register-submit"
              type="submit"
              className={`btn-primary-action btn-register-submit ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-dot" aria-hidden="true" />
                  <span>Registering...</span>
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>

        {/* Switch to Login */}
        {onGoToLogin && (
          <div className="auth-switch-box">
            <span>Already have an account?</span>
            <button
              type="button"
              className="btn-auth-switch"
              onClick={onGoToLogin}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Server & Architecture Info Note for Beginners */}
        <div className="register-info-box">
          <span className="info-icon" aria-hidden="true">💡</span>
          <div className="info-content">
            <strong>Backend Connection:</strong>
            <p>
              Submissions are sent directly to{' '}
              <code>POST http://localhost:5000/api/users/register</code> and stored securely in MongoDB Atlas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
