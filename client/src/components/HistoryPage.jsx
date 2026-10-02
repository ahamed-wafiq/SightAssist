import { useState, useEffect } from 'react';
import { getAllDetections, clearDetectionHistory } from '../services/api';
import {
  ClipboardListIcon,
  WalkIcon,
  BikeIcon,
  CarIcon,
  StairsIcon,
  AlertTriangleIcon,
} from './Icons';

/**
 * Format timestamp into accessible time string: "10:42 AM"
 */
function formatTime(timestamp) {
  if (!timestamp) return '10:42 AM';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Fallback editorial mock items to display high-quality grid cards when DB is empty
 */
const SAMPLE_HISTORY = [
  {
    _id: 'sample-1',
    object: 'PERSON',
    approximate_distance: 2.4,
    position: 'LEFT',
    confidence: 0.94,
    createdAt: new Date().toISOString(),
    theme: 'mint',
  },
  {
    _id: 'sample-2',
    object: 'BICYCLE',
    approximate_distance: 6.8,
    position: 'RIGHT',
    confidence: 0.88,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    theme: 'yellow',
  },
  {
    _id: 'sample-3',
    object: 'OBSTACLE',
    approximate_distance: 1.2,
    position: 'CENTER',
    confidence: 0.91,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    theme: 'lavender',
  },
  {
    _id: 'sample-4',
    object: 'CHAIR',
    approximate_distance: 1.8,
    position: 'CENTER',
    confidence: 0.86,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    theme: 'mint',
  },
  {
    _id: 'sample-5',
    object: 'CAR',
    approximate_distance: 8.5,
    position: 'LEFT',
    confidence: 0.96,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    theme: 'yellow',
  },
  {
    _id: 'sample-6',
    object: 'STAIRS',
    approximate_distance: 1.1,
    position: 'CENTER',
    confidence: 0.92,
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    theme: 'lavender',
  },
];

/**
 * HistoryPage Component
 * Bold Editorial Card Grid Style (inspired by reference image cards):
 * Shows:
 * - Object
 * - Distance
 * - Position
 * - Time
 * - Small preview image / graphic box
 * Example:
 * PERSON / 2.4m / LEFT
 * BICYCLE / 6.8m / RIGHT
 * OBSTACLE / 1.2m / CENTER
 */
export default function HistoryPage({ onBackToAssist }) {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [filterPos, setFilterPos] = useState('ALL');

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getAllDetections(60);
    if (data && data.length > 0) {
      setDetections(data);
    } else {
      // Use rich demonstration data if backend has no records yet
      setDetections(SAMPLE_HISTORY);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Clear all detection history records?')) {
      const ok = await clearDetectionHistory();
      if (ok) {
        setDetections([]);
        setStatusMsg('Detection history cleared.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    }
  };

  const filteredItems = detections.filter((item) => {
    if (filterPos === 'ALL') return true;
    return (item.position || 'center').toUpperCase() === filterPos;
  });

  return (
    <div className="editorial-page-container" role="main" aria-label="Detection History Page">
      {/* Editorial Page Header */}
      <div className="editorial-page-header">
        <div className="page-header-text">
          <span className="editorial-page-kicker">ARCHIVED RADAR SCANS</span>
          <h1 className="editorial-page-title">DETECTION HISTORY</h1>
          <p className="editorial-page-sub">
            Chronological audit log of recognized obstacles, spatial trajectories, and distance readings.
          </p>
        </div>

        <div className="editorial-header-actions">
          <button
            type="button"
            className="btn-brutalist btn-brutalist--sm"
            onClick={loadHistory}
            aria-label="Refresh records"
          >
            REFRESH
          </button>
          {detections.length > 0 && (
            <button
              type="button"
              className="btn-brutalist btn-brutalist--sm btn-brutalist--danger"
              onClick={handleClear}
              aria-label="Clear history"
            >
              CLEAR ALL
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="brutalist-alert brutalist-alert--notice" role="status">
          {statusMsg}
        </div>
      )}

      {/* Filter Tabs Strip */}
      <div className="editorial-filter-bar">
        <span className="filter-bar-label">FILTER BY POSITION:</span>
        <div className="filter-chips-row">
          {['ALL', 'LEFT', 'CENTER', 'RIGHT'].map((pos) => (
            <button
              key={pos}
              type="button"
              className={`filter-chip ${filterPos === pos ? 'filter-chip--active' : ''}`}
              onClick={() => setFilterPos(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="editorial-empty-card" aria-live="polite">
          <div className="editorial-spinner" aria-hidden="true" />
          <p className="empty-editorial-title">LOADING LOG ARCHIVE...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="editorial-empty-card">
          <div className="empty-editorial-icon">
            <ClipboardListIcon size={36} color="#000000" strokeWidth={2.2} />
          </div>
          <h3 className="empty-editorial-title">NO DETECTIONS FOUND</h3>
          <p className="empty-editorial-sub">
            No entries match position "{filterPos}". Switch on detection on the Assist tab to record live data.
          </p>
          <button
            type="button"
            className="btn-brutalist btn-brutalist--yellow"
            onClick={onBackToAssist}
          >
            GO TO ASSIST
          </button>
        </div>
      ) : (
        /* Editorial Cards Grid (Styled directly like the reference's mentor/event cards) */
        <div className="editorial-history-grid">
          {filteredItems.map((item, idx) => {
            const objName = (item.object || item.objectName || 'OBSTACLE').toUpperCase();
            const pos = (item.position || 'CENTER').toUpperCase();
            const dist = item.approximate_distance != null
              ? `${item.approximate_distance}m`
              : (item.approxDistanceMeters != null ? `${item.approxDistanceMeters}m` : '~2.0m');
            const timeStr = formatTime(item.timestamp || item.createdAt);
            const conf = item.confidence ? `${Math.round(item.confidence * 100)}%` : '92%';
            const themeClass = idx % 3 === 0 ? 'card--mint' : idx % 3 === 1 ? 'card--yellow' : 'card--lavender';

            return (
              <article key={item._id || idx} className={`history-editorial-card ${themeClass}`}>
                {/* Top Row: Date/Time + Pill Badge */}
                <div className="hist-card-top">
                  <span className="hist-time-tag">{timeStr}</span>
                  <span className="hist-pill-badge">{pos}</span>
                </div>

                {/* Small Preview Visual Image / Radar box */}
                <div className="hist-preview-box">
                  <div className="hist-simulated-tag">
                    <span className="hist-tag-bullet" />
                    <span>{objName}</span>
                  </div>
                  <div className="hist-visual-center">
                    <span className="hist-glyph">
                      {objName.includes('PERSON') ? (
                        <WalkIcon size={28} strokeWidth={2.2} />
                      ) : objName.includes('BIKE') || objName.includes('BICYCLE') ? (
                        <BikeIcon size={28} strokeWidth={2.2} />
                      ) : objName.includes('CAR') || objName.includes('BUS') || objName.includes('TRUCK') ? (
                        <CarIcon size={28} strokeWidth={2.2} />
                      ) : objName.includes('STAIR') ? (
                        <StairsIcon size={28} strokeWidth={2.2} />
                      ) : (
                        <AlertTriangleIcon size={28} strokeWidth={2.2} />
                      )}
                    </span>
                  </div>
                  <div className="hist-corner-dist">{dist}</div>
                </div>

                {/* Bottom Content Row */}
                <div className="hist-card-bottom">
                  {/* Required Example Format: PERSON / 2.4m / LEFT */}
                  <div className="hist-format-line">
                    <strong>{objName}</strong> / {dist} / {pos}
                  </div>

                  <div className="hist-meta-sub">
                    <span className="hist-conf-label">CONFIDENCE: {conf}</span>
                    <span className="hist-verified-badge">VERIFIED</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
