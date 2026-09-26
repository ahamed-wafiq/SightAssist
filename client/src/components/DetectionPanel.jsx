/**
 * DetectionPanel Component
 * Polished accessibility card presenting the most critical current obstacle:
 * - Current detection: OBJECT (huge), DIRECTION (LEFT/CENTER/RIGHT), APPROXIMATE DISTANCE (~X.X m)
 * - Smaller cards for secondary objects in the same scene
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
    <section className="detection-container" aria-label="Detected Obstacle Information">
      {/* Error alert if ML is unavailable */}
      {detectionError && (
        <div className="alert-banner alert-banner--warning" role="alert">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <div className="alert-body">
            <strong>System Notice:</strong> {detectionError}
          </div>
        </div>
      )}

      {/* Prominent Current Detection Card */}
      <div
        className={`prominent-detection-card ${
          primaryDetection ? 'prominent-detection-card--active' : ''
        }`}
        role="region"
        aria-live="polite"
      >
        <div className="card-top-header">
          <span className="card-kicker">CURRENT OBSTACLE</span>
          {isAssisting && (
            <span className="live-scanning-tag" aria-hidden="true">
              <span className="tag-dot" /> Live
            </span>
          )}
        </div>

        {primaryDetection ? (
          <div className="detection-hero-layout">
            {/* 1. Object Name */}
            <div className="hero-object-row">
              <h2 className="hero-object-name">
                {(primaryDetection.object || 'OBSTACLE').toUpperCase()}
              </h2>
              <span className="hero-confidence-badge">
                {Math.round((primaryDetection.confidence || 0) * 100)}%
              </span>
            </div>

            {/* 2. Direction & Distance Grid */}
            <div className="hero-details-grid">
              {/* Direction Indicator */}
              <div className="detail-item">
                <span className="detail-label">DIRECTION</span>
                <div
                  className={`direction-badge direction-badge--${(
                    primaryDetection.position || 'center'
                  ).toLowerCase()}`}
                >
                  {(primaryDetection.position || 'center').toLowerCase() === 'left' && (
                    <>
                      <span className="dir-arrow">←</span>
                      <span>LEFT</span>
                    </>
                  )}
                  {(primaryDetection.position || 'center').toLowerCase() === 'center' && (
                    <>
                      <span className="dir-arrow">↑</span>
                      <span>CENTER</span>
                    </>
                  )}
                  {(primaryDetection.position || 'center').toLowerCase() === 'right' && (
                    <>
                      <span className="dir-arrow">→</span>
                      <span>RIGHT</span>
                    </>
                  )}
                </div>
              </div>

              {/* Approximate Distance */}
              <div className="detail-item">
                <span className="detail-label">APPROX. DISTANCE</span>
                <div className="distance-display-group">
                  <span className="distance-value">
                    {primaryDetection.approximate_distance != null
                      ? `~${primaryDetection.approximate_distance} m`
                      : 'Unavailable'}
                  </span>
                  {primaryDetection.approximate_distance != null && (
                    <span
                      className={`proximity-pill ${
                        primaryDetection.approximate_distance <= 1.0
                          ? 'proximity-pill--close'
                          : primaryDetection.approximate_distance <= 2.2
                          ? 'proximity-pill--near'
                          : 'proximity-pill--mid'
                      }`}
                    >
                      {primaryDetection.approximate_distance <= 1.0
                        ? 'CLOSE'
                        : primaryDetection.approximate_distance <= 2.2
                        ? 'NEAR'
                        : 'SAFE'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isAssisting ? (
          <div className="detection-clear-state">
            <span className="clear-symbol" aria-hidden="true">✓</span>
            <div>
              <h3 className="clear-headline">Path Clear</h3>
              <p className="clear-subtext">No obstacles detected directly ahead.</p>
            </div>
          </div>
        ) : (
          <div className="detection-idle-state">
            <span className="idle-symbol" aria-hidden="true">ℹ️</span>
            <div>
              <p className="idle-headline">Assistance is paused</p>
              <p className="idle-subtext">
                Tap <strong>START ASSISTANCE</strong> below to begin real-time voice guidance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Detections (Smaller clean cards) */}
      {secondaryDetections.length > 0 && (
        <div className="secondary-objects-section">
          <span className="secondary-objects-title">
            Other Detected Objects ({secondaryDetections.length})
          </span>
          <div className="secondary-cards-grid">
            {secondaryDetections.map((item, idx) => {
              const pos = (item.position || 'center').toLowerCase();
              return (
                <div key={`${item.object}-${idx}`} className="secondary-card">
                  <div className="secondary-card-main">
                    <strong className="secondary-name">
                      {(item.object || '').toUpperCase()}
                    </strong>
                    <span className="secondary-pos">
                      {pos === 'left' ? '← Left' : pos === 'right' ? 'Right →' : '↑ Center'}
                    </span>
                  </div>
                  <div className="secondary-card-meta">
                    {item.approximate_distance != null && (
                      <span className="secondary-dist">~{item.approximate_distance}m</span>
                    )}
                    <span className="secondary-conf">
                      {Math.round((item.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
