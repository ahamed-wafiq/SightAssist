import { AlertTriangleIcon, EyeIcon } from './Icons';

/**
 * DetectionPanel Component
 * Editorial Brutalist Detection Cards:
 * Shows:
 * - Detected objects
 * - Object name (Huge display)
 * - Approximate distance (e.g. 2.4m)
 * - Position: LEFT / CENTER / RIGHT
 * Example:
 * "PERSON — LEFT — 2.4m"
 * "OBSTACLE — CENTER — 1.2m"
 */
export default function DetectionPanel({
  detections = [],
  primaryDetection = null,
  isAssisting,
  detectionError,
}) {
  const hasDetections = detections.length > 0;
  const secondaryDetections = hasDetections ? detections.slice(1) : [];

  return (
    <section className="detection-editorial-section" aria-label="Detected Objects Information">
      {/* Error alert if ML is unavailable */}
      {detectionError && (
        <div className="brutalist-alert brutalist-alert--warning" role="alert">
          <AlertTriangleIcon size={18} />
          <div className="alert-text">
            <strong>System Notice:</strong> {detectionError}
          </div>
        </div>
      )}

      {/* Primary Detection Card */}
      <div
        className={`detection-hero-card ${
          primaryDetection ? 'detection-hero-card--detected' : ''
        }`}
        role="region"
        aria-live="polite"
      >
        <div className="det-card-kicker-row">
          <span className="det-card-label">PRIMARY OBSTACLE IN VIEW</span>
          <span className="det-live-badge">
            <span className="live-dot" />
            {isAssisting ? 'ACTIVE SCAN' : 'READY'}
          </span>
        </div>

        {primaryDetection ? (
          <div className="det-hero-body">
            {/* Top Object + Confidence */}
            <div className="det-hero-header">
              <h2 className="det-object-headline">
                {(primaryDetection.object || 'OBSTACLE').toUpperCase()}
              </h2>
              <span className="det-confidence-pill">
                {Math.round((primaryDetection.confidence || 0) * 100)}% MATCH
              </span>
            </div>

            {/* Combined formatted example badge: "PERSON — LEFT — 2.4m" */}
            <div className="det-summary-callout">
              <span className="det-summary-text">
                {(primaryDetection.object || 'OBSTACLE').toUpperCase()} —{' '}
                {(primaryDetection.position || 'CENTER').toUpperCase()} —{' '}
                {primaryDetection.approximate_distance != null
                  ? `${primaryDetection.approximate_distance}m`
                  : 'N/A'}
              </span>
            </div>

            {/* Metric Blocks: Position & Distance */}
            <div className="det-metrics-columns">
              <div className="det-metric-box">
                <span className="metric-box-label">POSITION</span>
                <div
                  className={`det-dir-badge det-dir-badge--${(
                    primaryDetection.position || 'center'
                  ).toLowerCase()}`}
                >
                  {(primaryDetection.position || 'center').toLowerCase() === 'left' && '← LEFT'}
                  {(primaryDetection.position || 'center').toLowerCase() === 'center' && '↑ CENTER'}
                  {(primaryDetection.position || 'center').toLowerCase() === 'right' && '→ RIGHT'}
                </div>
              </div>

              <div className="det-metric-box">
                <span className="metric-box-label">APPROXIMATE DISTANCE</span>
                <div className="det-dist-number">
                  {primaryDetection.approximate_distance != null
                    ? `${primaryDetection.approximate_distance}m`
                    : 'Measuring...'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="det-idle-state">
            <div className="idle-indicator-circle">
              <EyeIcon size={26} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <h3 className="idle-title">PATH CLEAR</h3>
            <p className="idle-sub">
              {isAssisting
                ? 'Camera is actively scanning for obstacles ahead in real time.'
                : 'Press START DETECTION to activate real-time object and distance scanning.'}
            </p>

            {/* Example preview tags matching prompt requirements */}
            <div className="idle-example-chips">
              <span className="idle-chip">Example: PERSON — LEFT — 2.4m</span>
              <span className="idle-chip">Example: OBSTACLE — CENTER — 1.2m</span>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Detections Grid */}
      {secondaryDetections.length > 0 && (
        <div className="secondary-detections-editorial">
          <span className="secondary-title">ADDITIONAL DETECTIONS ({secondaryDetections.length})</span>
          <div className="secondary-grid">
            {secondaryDetections.map((item, idx) => (
              <div key={idx} className="secondary-card">
                <div className="sec-card-top">
                  <span className="sec-obj-name">{(item.object || 'Object').toUpperCase()}</span>
                  <span className="sec-pos-tag">{(item.position || 'Center').toUpperCase()}</span>
                </div>
                <div className="sec-card-bottom">
                  <span className="sec-dist">
                    {item.approximate_distance != null ? `~${item.approximate_distance}m` : 'In frame'}
                  </span>
                  <span className="sec-conf">
                    {Math.round((item.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
