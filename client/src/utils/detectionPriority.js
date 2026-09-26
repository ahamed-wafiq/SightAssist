/**
 * Detection Priority & Filtering Module for SightAssist
 * =====================================================
 * Implements prioritization rules for obstacle awareness:
 * 1. CENTER + close obstacle (<= 1.5m)
 * 2. CENTER (general obstacles ahead)
 * 3. LEFT / RIGHT close obstacle (<= 1.5m)
 * 4. Other objects
 *
 * Also provides configurable confidence filtering and noise reduction.
 */

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.50;
export const CLOSE_OBSTACLE_METERS = 1.5;
export const MIN_BOUNDING_BOX_PIXELS = 20;

/**
 * Calculates a numerical priority rank for a detected object.
 * Higher score = higher urgency to user.
 *
 * @param {object} item - Detection object { object, confidence, position, approximate_distance, bbox }
 * @returns {number} Priority score
 */
export function getDetectionPriorityScore(item) {
  if (!item) return -1;

  const position = (item.position || 'center').toLowerCase();
  const distance = item.approximate_distance;
  const isClose = distance !== null && distance !== undefined && distance <= CLOSE_OBSTACLE_METERS;
  const confidence = item.confidence || 0.5;

  let baseScore = 0;

  if (position === 'center' && isClose) {
    // 1. CENTER + close obstacle (Highest Priority)
    baseScore = 1000 - (distance || 0) * 50;
  } else if (position === 'center') {
    // 2. CENTER
    baseScore = 800 - (distance || 5) * 20;
  } else if ((position === 'left' || position === 'right') && isClose) {
    // 3. LEFT / RIGHT close obstacle
    baseScore = 600 - (distance || 0) * 30;
  } else {
    // 4. Other objects
    baseScore = 400 - (distance || 8) * 10;
  }

  // Factor in confidence as a tie-breaker
  return baseScore + confidence * 10;
}

/**
 * Filters raw YOLO detections based on confidence threshold and minimum bounding box size,
 * and removes duplicate/overlapping detections.
 *
 * @param {Array} detections - Raw detections array from YOLO
 * @param {object} options - Configurable thresholds
 * @returns {Array} Filtered detections
 */
export function filterDetections(
  detections,
  {
    minConfidence = DEFAULT_CONFIDENCE_THRESHOLD,
    minBoxSize = MIN_BOUNDING_BOX_PIXELS,
  } = {}
) {
  if (!Array.isArray(detections) || detections.length === 0) {
    return [];
  }

  const filtered = [];
  const seenSignatures = new Set();

  for (const item of detections) {
    // 1. Filter out low confidence detections
    if ((item.confidence || 0) < minConfidence) {
      continue;
    }

    // 2. Filter out extremely small bounding boxes (noise)
    if (Array.isArray(item.bbox) && item.bbox.length === 4) {
      const [x1, y1, x2, y2] = item.bbox;
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      if (width < minBoxSize || height < minBoxSize) {
        continue;
      }
    }

    // 3. Deduplicate identical object + position combinations in the same frame
    const dedupeKey = `${(item.object || '').toLowerCase()}_${(item.position || 'center').toLowerCase()}`;
    if (seenSignatures.has(dedupeKey)) {
      continue;
    }
    seenSignatures.add(dedupeKey);

    filtered.push(item);
  }

  // Sort by priority so the most critical object is first
  filtered.sort((a, b) => getDetectionPriorityScore(b) - getDetectionPriorityScore(a));

  return filtered;
}

/**
 * Returns the single most important detection in the current frame.
 * @param {Array} detections - Filtered detections
 * @returns {object|null} Top priority detection
 */
export function selectPrimaryDetection(detections) {
  if (!detections || detections.length === 0) return null;
  return detections[0];
}

export default {
  DEFAULT_CONFIDENCE_THRESHOLD,
  CLOSE_OBSTACLE_METERS,
  MIN_BOUNDING_BOX_PIXELS,
  getDetectionPriorityScore,
  filterDetections,
  selectPrimaryDetection,
};
