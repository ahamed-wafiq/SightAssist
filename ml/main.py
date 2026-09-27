import os
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# ==============================================================================
# SightAssist - FastAPI ML Inference Service
# ==============================================================================
# Tech Stack: Python, FastAPI, Ultralytics YOLO, OpenCV, Uvicorn
# Model: ml/model/best.pt
# ==============================================================================

app = FastAPI(
    title="SightAssist ML Service",
    description="Real-time YOLO object detection and spatial reasoning for accessibility",
    version="1.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# 1. Load YOLO Model ONCE at Startup
# ------------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best.pt")

if not os.path.exists(MODEL_PATH):
    fallback_best = os.path.join(BASE_DIR, "best.pt")
    if os.path.exists(fallback_best):
        MODEL_PATH = fallback_best
    else:
        raise FileNotFoundError(
            f"Trained model not found at '{MODEL_PATH}'. "
            "Please place your fine-tuned 'best.pt' model inside the 'ml/model/' directory."
        )

print(f"[SightAssist ML] Loading YOLO model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print(f"[SightAssist ML] Model loaded successfully! Registered classes: {len(model.names)}")


# ------------------------------------------------------------------------------
# 2. GET / and GET /health
# ------------------------------------------------------------------------------
@app.get("/")
def root():
    """Root endpoint for status check."""
    return {"status": "ok", "service": "SightAssist ML Service"}

@app.get("/health")
def health_check():
    """Health check endpoint returning ok status."""
    return {"status": "ok"}



# ------------------------------------------------------------------------------
# 3. POST /detect
# ------------------------------------------------------------------------------
@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    POST /detect
    Accepts an uploaded image file, runs YOLO inference, and returns detected objects
    with confidence >= 0.40, bounding boxes, left/center/right position, and approximate distance.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided in request.")

    # Read image bytes safely
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Decode image using OpenCV
    try:
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error decoding image: {str(e)}")

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Please upload a valid image file (JPEG, PNG, WebP, etc.).",
        )

    img_height, img_width, _ = image.shape

    # Run YOLO inference with confidence threshold 0.40
    try:
        results = model.predict(source=image, conf=0.40, verbose=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    detections = []

    if results and len(results) > 0:
        boxes = results[0].boxes

        if boxes is not None:
            for box in boxes:
                confidence = float(box.conf[0])

                # Enforce confidence threshold >= 0.40
                if confidence < 0.40:
                    continue

                # Object class name
                cls_id = int(box.cls[0])
                object_name = model.names.get(cls_id, f"Object_{cls_id}")

                # Bounding box coordinates [x1, y1, x2, y2]
                xyxy = box.xyxy[0].tolist()
                x1, y1, x2, y2 = [round(float(c), 1) for c in xyxy]

                # Position calculation (left / center / right) based on horizontal center
                center_x = (x1 + x2) / 2.0
                norm_x = center_x / max(img_width, 1)

                if norm_x < 0.33:
                    position = "left"
                elif norm_x > 0.66:
                    position = "right"
                else:
                    position = "center"

                # Relative distance estimation based on bounding-box height
                box_height = max(1.0, y2 - y1)
                h_ratio = box_height / max(img_height, 1)

                if h_ratio >= 0.60:
                    distance = "very near"
                elif h_ratio >= 0.35:
                    distance = "near"
                elif h_ratio >= 0.15:
                    distance = "medium"
                else:
                    distance = "far"

                # Approximate numeric distance in meters (e.g. 1.8)
                approximate_distance = round(max(0.5, min(10.0, 1.8 / max(h_ratio, 0.05))), 1)

                detections.append({
                    "object": object_name,
                    "confidence": round(confidence, 2),
                    "position": position,
                    "distance": distance,
                    "approximate_distance": approximate_distance,
                    "bbox": [x1, y1, x2, y2],
                })

    return {"detections": detections}


# Alias for backward compatibility with clients calling /predict
@app.post("/predict")
async def predict_alias(file: UploadFile = File(...)):
    """Alias for /detect to ensure compatibility."""
    return await detect_objects(file)


# ------------------------------------------------------------------------------
# Entrypoint for running Uvicorn server
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    # Render assigns dynamic port via PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    is_production = os.environ.get("RENDER") is not None or os.environ.get("ENVIRONMENT") == "production"
    print(f"[SightAssist ML] Starting Uvicorn server on 0.0.0.0:{port} (production={is_production})")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=not is_production)

