/**
 * SightAssist Backend API Client
 * Connects React frontend to Express + MongoDB backend
 */

/**
 * Backend URLs (Render Cloud Deployment & Local Dev Fallback)
 */
export const RENDER_BACKEND_URL = 'https://sightassist.onrender.com';
export const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : `${RENDER_BACKEND_URL}/api`);

/**
 * Fetch User Settings from MongoDB
 */
export async function getStoredSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.settings;
  } catch (err) {
    console.warn('[API] Could not fetch settings, using local defaults:', err.message);
    return null;
  }
}

/**
 * Save / Update User Settings in MongoDB
 */
export async function saveStoredSettings(settings) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.settings;
  } catch (err) {
    console.warn('[API] Could not save settings to backend:', err.message);
    return null;
  }
}

/**
 * Fetch Recent Detections (Last 20)
 */
export async function getRecentDetections() {
  try {
    const res = await fetch(`${API_BASE}/detections/recent`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.detections || [];
  } catch (err) {
    console.warn('[API] Could not fetch recent detections:', err.message);
    return [];
  }
}

/**
 * Fetch All / Paginated Detections
 */
export async function getAllDetections(limit = 50) {
  try {
    const res = await fetch(`${API_BASE}/detections?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.detections || [];
  } catch (err) {
    console.warn('[API] Could not fetch detections history:', err.message);
    return [];
  }
}

/**
 * Record a detected obstacle to detection history in MongoDB
 * Note: Camera video/images are NEVER sent or stored.
 */
let lastLoggedTime = 0;
let lastLoggedObject = '';

export async function logDetection(item) {
  if (!item || !item.object) return;

  const now = Date.now();
  // Throttle logging to at most once per 2.5 seconds per object to avoid database spam
  if (now - lastLoggedTime < 2500 && item.object === lastLoggedObject) {
    return;
  }

  lastLoggedTime = now;
  lastLoggedObject = item.object;

  try {
    const payload = {
      object: item.object,
      confidence: item.confidence,
      position: item.position || 'center',
      approximate_distance: item.approximate_distance,
      timestamp: new Date().toISOString(),
    };

    await fetch(`${API_BASE}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking log failure
    console.warn('[API] Failed to record detection log:', err.message);
  }
}

/**
 * Clear Detection History
 */
export async function clearDetectionHistory() {
  try {
    const res = await fetch(`${API_BASE}/detections`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return true;
  } catch (err) {
    console.warn('[API] Failed to clear detection history:', err.message);
    return false;
  }
}

/**
 * Fetch Emergency Contacts
 */
export async function getEmergencyContacts() {
  try {
    const res = await fetch(`${API_BASE}/emergency/contacts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.contacts || [];
  } catch (err) {
    console.warn('[API] Could not fetch emergency contacts:', err.message);
    return [];
  }
}

/**
 * Add Emergency Contact
 */
export async function addEmergencyContact(contact) {
  try {
    const res = await fetch(`${API_BASE}/emergency/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.contact;
  } catch (err) {
    console.error('[API] Failed to add emergency contact:', err);
    throw err;
  }
}

/**
 * Delete Emergency Contact
 */
export async function deleteEmergencyContact(id) {
  try {
    const res = await fetch(`${API_BASE}/emergency/contacts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return true;
  } catch (err) {
    console.error('[API] Failed to delete emergency contact:', err);
    throw err;
  }
}

/**
 * Trigger Simulated Emergency SOS
 */
export async function triggerEmergencySOS(details = {}) {
  try {
    const res = await fetch(`${API_BASE}/emergency/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.sosEvent;
  } catch (err) {
    console.error('[API] Failed to trigger emergency SOS:', err);
    throw err;
  }
}

/**
 * Register a new user in MongoDB through Express backend
 * @route POST http://localhost:5000/api/users/register
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<{success: boolean, message?: string, user?: Object, error?: string}>}
 */
export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: 'Invalid response received from server. Please verify the backend is running.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || `Registration failed (HTTP ${response.status})`,
      };
    }

    return {
      success: true,
      message: data.message || 'User registered successfully',
      user: data.user,
    };
  } catch (err) {
    // Network errors or backend offline
    return {
      success: false,
      error: 'Backend is unavailable. Please make sure the Express server is running on http://localhost:5000.',
    };
  }
}

/**
 * Authentication Token Management (Secure client storage for JWT)
 * Note: Never store plain-text passwords on the client.
 */
const TOKEN_KEY = 'sightassist_jwt_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (err) {
    console.error('Failed to store JWT in localStorage:', err);
  }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove JWT from localStorage:', err);
  }
}

/**
 * Authenticate user with Email & Password
 * @route POST http://localhost:5000/api/users/login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{success: boolean, message?: string, token?: string, user?: Object, error?: string}>}
 */
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: 'Invalid response from server. Please verify backend is running.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || 'Invalid email or password',
      };
    }

    // Securely save JWT in localStorage
    if (data.token) {
      setAuthToken(data.token);
    }

    return {
      success: true,
      message: data.message || 'Login successful',
      token: data.token,
      user: data.user,
    };
  } catch {
    return {
      success: false,
      error: 'Backend is unavailable. Please make sure the Express server is running on http://localhost:5000.',
    };
  }
}

/**
 * Fetch currently authenticated user profile from protected endpoint
 * @route GET http://localhost:5000/api/users/me
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: 'No authentication token found' };
  }

  try {
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token is invalid or expired
      removeAuthToken();
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return { success: false, error: 'Invalid response from server.' };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || 'Failed to fetch user profile',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch {
    return {
      success: false,
      error: 'Backend is unavailable. Please check your connection.',
    };
  }
}

/**
 * Logout current user
 */
export function logoutUser() {
  removeAuthToken();
}


