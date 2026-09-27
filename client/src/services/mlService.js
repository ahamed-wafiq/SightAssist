/**
 * ML Service API Client
 * Communicates directly with the FastAPI Python inference microservice
 * running on Render or local environment.
 */

export const RENDER_ML_API_URL = 'https://sightassist-ml.onrender.com';

export const ML_API_BASE = (
  import.meta.env.VITE_ML_API_URL ||
  RENDER_ML_API_URL
).replace(/\/+$/, '');

/**
 * Checks if the Python ML microservice is online and accessible
 * GET ${VITE_ML_API_URL}/health
 * @returns {Promise<{ online: boolean, details?: any, error?: string }>}
 */
export async function checkMLServiceHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${ML_API_BASE}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { online: true, details: data };
    }
    return { online: false, error: `Service responded with status ${response.status}` };
  } catch (err) {
    return {
      online: false,
      error: `Python ML service is not reachable at ${ML_API_BASE}/health.`,
    };
  }
}

/**
 * Sends a captured camera frame blob to the Python YOLO /detect endpoint
 * POST ${VITE_ML_API_URL}/detect
 * @param {Blob} imageBlob - JPEG image blob captured from the camera video
 * @returns {Promise<{ detections: Array<{ object: string, confidence: number, position: string, distance?: string, approximate_distance?: number, bbox?: number[] }> }>}
 */
export async function predictFrame(imageBlob) {
  if (!imageBlob || !(imageBlob instanceof Blob)) {
    throw new Error('Invalid image frame provided for detection.');
  }

  const formData = new FormData();
  formData.append('file', imageBlob, 'camera-frame.jpg');

  let response;
  try {
    response = await fetch(`${ML_API_BASE}/detect`, {
      method: 'POST',
      body: formData,
    });
    // Fallback to /predict if 404
    if (response.status === 404) {
      response = await fetch(`${ML_API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      });
    }
  } catch (networkErr) {
    throw new Error(
      `Python ML service is unavailable at ${ML_API_BASE}/detect. Please verify the service is running.`
    );
  }

  if (!response.ok) {
    let errorDetail = 'Inference request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch (_) {
      errorDetail = `Server returned ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data;
}

export default {
  checkMLServiceHealth,
  predictFrame,
  ML_API_BASE,
};
