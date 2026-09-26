/**
 * ML Service API Client
 * Communicates directly with the FastAPI Python inference microservice
 * running at http://localhost:5001.
 */

const ML_API_BASE = 'http://127.0.0.1:8000';

/**
 * Checks if the Python ML microservice is online and accessible
 * @returns {Promise<{ online: boolean, details?: any }>}
 */
export async function checkMLServiceHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

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
    // Attempt fallback to 5001 if 8000 fails
    try {
      const fbRes = await fetch('http://127.0.0.1:5001/health');
      if (fbRes.ok) {
        return { online: true, details: await fbRes.json() };
      }
    } catch (_) {}
    return {
      online: false,
      error: 'Python ML service is not reachable on http://127.0.0.1:8000.',
    };
  }
}

/**
 * Sends a captured camera frame blob to the Python YOLO /predict endpoint
 * @param {Blob} imageBlob - JPEG image blob captured from the camera video
 * @returns {Promise<{ detections: Array<{ object: string, confidence: number, position: string }> }>}
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
    try {
      response = await fetch('http://127.0.0.1:5001/detect', {
        method: 'POST',
        body: formData,
      });
    } catch (_) {
      throw new Error(
        'Python ML service is unavailable at http://127.0.0.1:8000/detect. Please ensure "python main.py" is running in the /ml folder.'
      );
    }
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
};
