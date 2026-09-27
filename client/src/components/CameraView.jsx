import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

/**
 * CameraView Component
 * ====================
 * - Accesses camera via MediaDevices API.
 * - Draws live bounding boxes on top of video feed for detected objects.
 * - Displays object name, confidence, and approximate distance on each box.
 * - Highlight the current primary / important detection.
 * - Direction indicator: LEFT | CENTER | RIGHT with active highlighted zone.
 * - Front/back camera switching where supported.
 * - Handles camera errors and provides in-memory frame capture.
 * - Never stores or uploads camera footage.
 */
const CameraView = forwardRef(function CameraView(
  {
    isCameraActive,
    onToggleCamera,
    isAssistanceActive,
    detections = [],
    primaryDetection = null,
    preferredCamera = 'environment',
    onCameraError,
    isMuted = false,
    onToggleMute,
  },
  ref
) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraFacing, setCameraFacing] = useState(preferredCamera || 'environment');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Sync preferred camera from settings
  useEffect(() => {
    if (preferredCamera && (preferredCamera === 'environment' || preferredCamera === 'user')) {
      setCameraFacing(preferredCamera);
    }
  }, [preferredCamera]);

  // Check available camera devices (front / rear)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Expose in-memory frame capture
  useImperativeHandle(ref, () => ({
    /**
     * Captures current video frame as an in-memory JPEG Blob for Python ML inference.
     * Temporary only; never uploaded or stored permanently.
     */
    captureFrameBlob: () => {
      return new Promise((resolve, reject) => {
        if (!videoRef.current || !isCameraActive) {
          return reject(new Error('CAMERA_WARMING_UP'));
        }
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
          return reject(new Error('CAMERA_WARMING_UP'));
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('CAMERA_WARMING_UP'));
              }
            },
            'image/jpeg',
            0.85
          );
        } catch (err) {
          reject(err);
        }
      });
    },
  }));

  // Handle Camera Stream Start / Stop
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      setErrorMsg(null);
      setIsInitializing(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = 'Camera API is not supported in this browser. Please use Chrome, Edge, or Safari.';
        setErrorMsg(msg);
        if (onCameraError) onCameraError(msg);
        setIsInitializing(false);
        return;
      }

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsInitializing(false);
      } catch (err) {
        if (!isMounted) return;
        setIsInitializing(false);
        let userFriendlyError = 'Could not access camera.';

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          userFriendlyError = 'Camera permission was denied. Please allow camera access in your browser address bar.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          userFriendlyError = 'No camera device found on this system.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          userFriendlyError = 'Camera is currently in use by another application.';
        } else {
          userFriendlyError = `Camera error: ${err.message || 'Unknown error'}`;
        }

        setErrorMsg(userFriendlyError);
        if (onCameraError) onCameraError(userFriendlyError);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsInitializing(false);
    };

    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isCameraActive, cameraFacing, onCameraError]);

  const toggleFacingMode = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  /**
   * Draw real-time bounding boxes with object name, confidence, and distance.
   * Highlights the current primary detection with thicker border & indicator.
   */
  const drawBoundingBoxes = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isCameraActive || !detections || detections.length === 0) {
      return;
    }

    // Match canvas internal resolution to client display size
    const clientW = video.clientWidth;
    const clientH = video.clientHeight;
    if (clientW === 0 || clientH === 0) return;

    if (canvas.width !== clientW || canvas.height !== clientH) {
      canvas.width = clientW;
      canvas.height = clientH;
    }

    const videoNativeW = video.videoWidth || clientW;
    const videoNativeH = video.videoHeight || clientH;

    const scaleX = clientW / videoNativeW;
    const scaleY = clientH / videoNativeH;

    detections.forEach((item) => {
      if (!item.bbox || item.bbox.length < 4) return;
      const [x1, y1, x2, y2] = item.bbox;

      const bx = x1 * scaleX;
      const by = y1 * scaleY;
      const bw = (x2 - x1) * scaleX;
      const bh = (y2 - y1) * scaleY;

      const isPrimary =
        primaryDetection &&
        item.object === primaryDetection.object &&
        item.confidence === primaryDetection.confidence;

      // Color coding by spatial position (Warm Yellow, Vibrant Cyan, Coral)
      const pos = (item.position || 'center').toUpperCase();
      let color = '#FFCE29'; // Center: sunflower yellow
      if (pos === 'LEFT') color = '#00F0FF'; // Left: vibrant cyan
      if (pos === 'RIGHT') color = '#FF5252'; // Right: vibrant coral

      // 1. Draw Bounding Box (Thick brutalist stroke)
      ctx.strokeStyle = color;
      ctx.lineWidth = isPrimary ? 5 : 3;
      ctx.strokeRect(bx, by, bw, bh);

      // Translucent box fill
      ctx.fillStyle = pos === 'LEFT'
        ? (isPrimary ? 'rgba(0, 240, 255, 0.18)' : 'rgba(0, 240, 255, 0.08)')
        : pos === 'RIGHT'
        ? (isPrimary ? 'rgba(255, 82, 82, 0.18)' : 'rgba(255, 82, 82, 0.08)')
        : (isPrimary ? 'rgba(255, 206, 41, 0.18)' : 'rgba(255, 206, 41, 0.08)');
      ctx.fillRect(bx, by, bw, bh);

      // 2. Prepare Label Content (Format: "PERSON — LEFT — 2.4m")
      const objName = (item.object || 'OBSTACLE').toUpperCase();
      const distStr = item.approximate_distance != null ? `${item.approximate_distance}m` : 'NEAR';
      const labelText = `${objName} — ${pos} — ${distStr}`;

      ctx.font = 'bold 13px "Space Grotesk", Outfit, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 16;
      const labelHeight = 26;

      // Place tag label above box, or just inside top if near top of frame
      let tagX = bx;
      let tagY = by - labelHeight - 4;
      if (tagY < 4) {
        tagY = by + 4;
      }
      if (tagX + labelWidth > clientW) {
        tagX = clientW - labelWidth - 4;
      }

      // Draw high-contrast brutalist badge (Deep black background with colored border)
      ctx.fillStyle = '#000000';
      ctx.fillRect(tagX, tagY, labelWidth, labelHeight);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tagX, tagY, labelWidth, labelHeight);

      // Draw Bold Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(labelText, tagX + 8, tagY + 18);
    });
  }, [detections, isCameraActive, primaryDetection]);

  // Redraw bounding boxes whenever detections change
  useEffect(() => {
    drawBoundingBoxes();
  }, [drawBoundingBoxes]);

  // Active direction from primary detection
  const activeDirection = primaryDetection
    ? (primaryDetection.position || 'center').toLowerCase()
    : null;

  return (
    <section className="camera-section" aria-label="Camera Live View and Controls">
      <div className="camera-header-row">
        <h2 className="section-title">Live Camera View</h2>
        <span
          className={`status-pill ${isCameraActive ? 'status-pill--active' : 'status-pill--inactive'}`}
          role="status"
          aria-live="polite"
        >
          {isCameraActive ? '● Camera Online' : '○ Camera Off'}
        </span>
      </div>

      {/* Main Viewport Container */}
      <div
        className={`camera-viewport ${isCameraActive ? 'camera-viewport--live' : ''} ${
          isAssistanceActive ? 'camera-viewport--assisting' : ''
        }`}
        aria-live="polite"
      >
        <video
          ref={videoRef}
          className={`camera-video ${isCameraActive ? 'camera-video--visible' : ''}`}
          playsInline
          autoPlay
          muted
          aria-label="Live camera preview stream"
        />

        {/* Real-time Bounding Box Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="camera-overlay-canvas"
          aria-hidden="true"
        />

        {/* Viewport Overlay Corner Guides */}
        {isCameraActive && (
          <div className="camera-overlay-guides" aria-hidden="true">
            <div className="guide-corner guide-top-left" />
            <div className="guide-corner guide-top-right" />
            <div className="guide-corner guide-bottom-left" />
            <div className="guide-corner guide-bottom-right" />
          </div>
        )}

        {/* Off State */}
        {!isCameraActive && !errorMsg && (
          <div className="camera-placeholder">
            <div className="placeholder-icon" aria-hidden="true">📷</div>
            <p className="placeholder-text">Camera is currently paused.</p>
            <p className="placeholder-subtext">
              Press <strong>START ASSISTANCE</strong> below to begin real-time AI scanning.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {isInitializing && (
          <div className="camera-loading-overlay" aria-live="assertive">
            <div className="spinner" aria-hidden="true" />
            <p>Requesting camera permission...</p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="camera-error-banner" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <div className="error-text">
              <strong>Camera Alert:</strong> {errorMsg}
            </div>
          </div>
        )}
      </div>

      {/* 9. Direction Indicator: LEFT | CENTER | RIGHT */}
      <div
        className="direction-indicator-strip"
        role="region"
        aria-label="Directional Awareness Indicator"
      >
        <div
          className={`dir-strip-segment ${
            activeDirection === 'left' ? 'dir-strip-segment--active dir-strip-segment--left' : ''
          }`}
        >
          <span className="dir-strip-arrow">←</span> LEFT
        </div>
        <div
          className={`dir-strip-segment ${
            activeDirection === 'center' ? 'dir-strip-segment--active dir-strip-segment--center' : ''
          }`}
        >
          <span className="dir-strip-arrow">↑</span> CENTER
        </div>
        <div
          className={`dir-strip-segment ${
            activeDirection === 'right' ? 'dir-strip-segment--active dir-strip-segment--right' : ''
          }`}
        >
          <span className="dir-strip-arrow">→</span> RIGHT
        </div>
      </div>

      {/* Camera Controls (Start/Stop + Mute/Unmute + Switch Front/Back) */}
      <div className="camera-controls-grid">
        <button
          type="button"
          id="btn-camera-toggle"
          className={`btn-camera-toggle ${isCameraActive ? 'btn-camera-toggle--stop' : 'btn-camera-toggle--start'}`}
          onClick={onToggleCamera}
          aria-label={isCameraActive ? 'Stop camera' : 'Start camera'}
        >
          <span className="btn-icon" aria-hidden="true">{isCameraActive ? '⏹' : '▶'}</span>
          <span className="btn-label">{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        {onToggleMute && (
          <button
            type="button"
            id="btn-camera-mute"
            className={`btn-camera-switch ${isMuted ? 'btn-camera-switch--muted' : ''}`}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            title={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
          >
            <span className="btn-icon" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
            <span className="btn-label">{isMuted ? 'Unmute Voice' : 'Mute Voice'}</span>
          </button>
        )}

        {isCameraActive && (
          <button
            type="button"
            className="btn-camera-switch"
            onClick={toggleFacingMode}
            aria-label={`Switch camera. Currently using ${cameraFacing === 'environment' ? 'back camera' : 'front camera'}`}
            title="Switch front/back camera"
          >
            <span className="btn-icon" aria-hidden="true">🔄</span>
            <span className="btn-label">
              {cameraFacing === 'environment' ? 'Switch to Front' : 'Switch to Back'}
            </span>
          </button>
        )}
      </div>
    </section>
  );
});

export default CameraView;
