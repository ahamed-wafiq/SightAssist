/**
 * SightAssist Backend API Client
 * Connects React frontend to Express + MongoDB backend
 */

const API_BASE = 'http://localhost:5000/api';

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
