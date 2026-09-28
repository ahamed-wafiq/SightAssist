/**
 * ML Service API Client
 * Communicates directly with the deployed YOLO ML inference microservice
 * React → ML API → YOLO (never routed through Node/Express)
 */

export const DEFAULT_ML_API_URL = 'https://cuddle-faceted-charger.ngrok-free.dev';

export const ML_API_BASE = (
  import.meta.env.VITE_ML_API_URL ||
  DEFAULT_ML_API_URL
).replace(/\/+$/, '');

/**
 * Checks if the ML microservice is online and accessible
 * GET ${import.meta.env.VITE_ML_API_URL}/health
 * @returns {Promise<{ online: boolean, details?: any, error?: string }>}
 */
export async function checkMLServiceHealth() {
  const baseUrl = (import.meta.env.VITE_ML_API_URL || ML_API_BASE).replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/health`, {
      signal: controller.signal,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { online: true, details: data };
    }

    // Fallback check root / if /health is not implemented on the deployed server
    if (response.status === 404) {
      const rootRes = await fetch(`${baseUrl}/`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (rootRes.ok) {
        return { online: true, details: await rootRes.json() };
      }
    }

    return { online: false, error: `Service responded with status ${response.status}` };
  } catch (err) {
    return {
      online: false,
      error: `ML API service is not reachable at ${baseUrl}.`,
    };
  }
}

/**
 * Sends a captured camera frame blob directly to the YOLO /detect endpoint
 * POST ${import.meta.env.VITE_ML_API_URL}/detect
 * @param {Blob} imageBlob - JPEG image blob captured from camera video
 * @returns {Promise<{ success?: boolean, device?: string, image_width?: number, image_height?: number, detections: Array<{ object: string, confidence: number, position: string, distance: string, approximate_distance?: number, bbox: number[] }> }>}
 */
export async function predictFrame(imageBlob) {
  if (!imageBlob || !(imageBlob instanceof Blob)) {
    throw new Error('Invalid image frame provided for detection.');
  }

  // Camera frames go directly: React -> ML API -> YOLO (not via Node/Express)
  const formData = new FormData();
  formData.append('file', imageBlob, 'frame.jpg');

  const baseUrl = (import.meta.env.VITE_ML_API_URL || ML_API_BASE).replace(/\/+$/, '');
  const detectUrl = `${import.meta.env.VITE_ML_API_URL || baseUrl}/detect`;

  let response;
  try {
    response = await fetch(detectUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    // Fallback to /predict if 404
    if (response.status === 404) {
      response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });
    }
  } catch (networkErr) {
    throw new Error(
      `ML API service is unavailable at ${detectUrl}. Please verify the service is running.`
    );
  }

  if (!response.ok) {
    let errorDetail = 'Inference request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch (_) {
      errorDetail = `ML service returned status ${response.status} (${response.statusText || 'Error'})`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();

  // Distance label to numerical meter mapping for UI metrics & prioritization
  const distanceToMeters = {
    'very near': 0.8,
    'near': 1.5,
    'medium distance': 2.5,
    'medium': 2.5,
    'far': 4.5,
  };

  // Process & normalize detections: { object, confidence, bbox, position, distance, approximate_distance }
  const rawDetections = Array.isArray(data.detections) ? data.detections : [];
  const normalizedDetections = rawDetections.map((item) => {
    const rawDist = item.distance ? String(item.distance).toLowerCase().trim() : '';
    let approxDist = item.approximate_distance != null ? Number(item.approximate_distance) : null;

    // Estimate numeric distance if not explicitly returned by API
    if (approxDist == null && rawDist) {
      approxDist = distanceToMeters[rawDist] ?? 2.0;
    }

    // Standardize distance category for voice alerts
    let distCategory = item.distance;
    if (!distCategory && approxDist != null) {
      if (approxDist <= 1.0) distCategory = 'very near';
      else if (approxDist <= 1.8) distCategory = 'near';
      else if (approxDist <= 3.5) distCategory = 'medium distance';
      else distCategory = 'far';
    }

    return {
      ...item,
      object: item.object || 'obstacle',
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
      position: (item.position || 'center').toLowerCase(),
      distance: distCategory || 'near',
      approximate_distance: approxDist != null ? Number(approxDist.toFixed(1)) : null,
      bbox: Array.isArray(item.bbox) ? item.bbox : [],
    };
  });

  return {
    ...data,
    detections: normalizedDetections,
  };
}

export default {
  checkMLServiceHealth,
  predictFrame,
  ML_API_BASE,
};
