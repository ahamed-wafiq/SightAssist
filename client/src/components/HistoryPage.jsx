import { useState, useEffect } from 'react';
import { getAllDetections, clearDetectionHistory } from '../services/api';

/**
 * Format timestamp into accessible time string: "10:42 AM"
 */
function formatTime(timestamp) {
  if (!timestamp) return 'Just now';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Categorize into Date buckets: "Today", "Yesterday", or "Earlier"
 */
function getDateBucket(timestamp) {
  if (!timestamp) return 'Today';
  const itemDate = new Date(timestamp);
  const now = new Date();

  if (itemDate.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (itemDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return itemDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Detection History Page Component
 */
export default function HistoryPage({ onBackToAssist }) {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getAllDetections(60);
    setDetections(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear detection history?')) {
      const ok = await clearDetectionHistory();
      if (ok) {
        setDetections([]);
        setStatusMsg('History cleared successfully.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    }
  };

  // Group detections by Date Bucket
  const grouped = detections.reduce((acc, item) => {
    const bucket = getDateBucket(item.timestamp || item.createdAt);
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(item);
    return acc;
  }, {});

  return (
    <div className="page-container" role="main" aria-label="Detection History Page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Detection History</h2>
          <p className="page-subtitle">Logs of previously detected obstacles</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-history-action"
            onClick={loadHistory}
            aria-label="Refresh history"
            title="Refresh history"
          >
            🔄 Refresh
          </button>
          {detections.length > 0 && (
            <button
              type="button"
              className="btn-history-action btn-history-action--clear"
              onClick={handleClear}
              aria-label="Clear all detection history"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="status-notice-banner" role="status">
          {statusMsg}
        </div>
      )}

      {isLoading ? (
        <div className="loading-state-card" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p>Loading detection records...</p>
        </div>
      ) : detections.length === 0 ? (
        <div className="empty-state-card" role="region">
          <div className="empty-icon" aria-hidden="true">📋</div>
          <h3 className="empty-title">No Detections Yet</h3>
          <p className="empty-subtext">
            Start real-time assistance on the main screen to automatically record detected obstacles.
          </p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={onBackToAssist}
          >
            Go to Assist
          </button>
        </div>
      ) : (
        <div className="history-groups-list">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <section key={dateLabel} className="history-date-section">
              <h3 className="history-date-header">{dateLabel}</h3>
              <div className="history-cards-stack">
                {items.map((item, idx) => {
                  const objName = (item.object || item.objectName || 'Obstacle').toUpperCase();
                  const pos = (item.position || 'Center').toUpperCase();
                  const dist = item.approximate_distance != null
                    ? `~${item.approximate_distance} m`
                    : (item.approxDistanceMeters != null ? `~${item.approxDistanceMeters} m` : 'Distance unknown');
                  const timeStr = formatTime(item.timestamp || item.createdAt);
                  const conf = item.confidence ? `${Math.round(item.confidence * 100)}%` : '';

                  return (
                    <div
                      key={item._id || `${dateLabel}-${idx}`}
                      className="history-entry-card"
                      role="article"
                    >
                      <div className="history-time-col">
                        <span className="history-time">{timeStr}</span>
                        {conf && <span className="history-conf">{conf}</span>}
                      </div>

                      <div className="history-info-col">
                        <strong className="history-object-name">{objName}</strong>
                        <div className="history-meta-row">
                          <span className={`history-pos-badge history-pos-badge--${pos.toLowerCase()}`}>
                            {pos === 'LEFT' ? '← LEFT' : pos === 'RIGHT' ? 'RIGHT →' : '↑ CENTER'}
                          </span>
                          <span className="history-dist-badge">{dist}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
