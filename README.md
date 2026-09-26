# SightAssist 👁️

> **AI-Powered Assistive Vision System for Visually Impaired Users**

SightAssist is an accessible, real-time computer vision assistant designed to empower visually impaired and low-vision individuals to navigate indoor and outdoor spaces with independence and confidence.

---

## 🎯 Purpose & Overview

Navigating dynamic environments presents significant challenges for visually impaired people. SightAssist turns a standard smartphone or web camera into an intelligent guide that:
- Captures live video frames from the browser without recording or permanently storing footage.
- Detects obstacles and environmental hazards in real time.
- Identifies spatial orientation (**Left**, **Center / In Front**, **Right**).
- Estimates approximate distance (**Very Near**, **Near**, **Medium**, **Far**).
- Delivers spoken guidance and spatial cues via the Web Speech API with built-in anti-spam cooldowns.

---

## 🏗️ System Architecture & ML Pipeline

```
  [ User Camera ]
        │ (Live WebRTC / getUserMedia feed)
        ▼
  [ React Client ]
        │ (Captures in-memory JPEG frame every 1s via hidden Canvas)
        ▼
  POST http://127.0.0.1:8000/detect
        │ (multipart/form-data)
        ▼
  [ FastAPI Microservice ]
        │ (Runs inference on loaded YOLO model)
        ▼
  [ YOLO Object Detection (best.pt) ]
        │ (Detects classes, bboxes, confidences >= 0.40)
        ▼
  [ Spatial & Distance Engine ]
        │ (Calculates left/center/right and relative distance)
        ▼
  [ JSON Response ] ──► [ React Client ] ──► [ Screen & Web Speech Audio Alert ]
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Vanilla CSS | Accessible UI, live camera preview, canvas frame capture, Web Speech API audio alerts |
| **ML Inference Service** | Python 3.10+, FastAPI, Ultralytics YOLO, OpenCV, Uvicorn | High-performance asynchronous microservice running YOLO inference |
| **Model** | Fine-tuned **YOLO11n** | Lightweight real-time object detection optimized for edge & mobile devices |
| **Backend** | Node.js, Express.js | REST API for settings persistence, historical telemetry, and emergency contacts |
| **Database** | MongoDB | Stores accessibility preferences and event logs |

---

## 🧠 YOLO Model & Dataset

SightAssist utilizes a fine-tuned **YOLO11n** model trained specifically for accessibility navigation and obstacle avoidance.

### 25 Obstacle Classes
The model detects 25 critical indoor and outdoor objects:
1. `Bike`
2. `Building`
3. `Car`
4. `Person`
5. `Stairs`
6. `Traffic sign`
7. `Electrical Pole`
8. `Road`
9. `Motorcycle`
10. `Dustbin`
11. `Dog`
12. `Manhole`
13. `Tree`
14. `Guard rail`
15. `Pedestrian crosswalk`
16. `Truck`
17. `Bus`
18. `Bench`
19. `Traffic Cone`
20. `Fire hydrant`
21. `Traffic Barrel`
22. `Plant Pot`
23. `Electrical Box`
24. `Chair`
25. `Bicycle Rack`

### 📊 Validation Results

| Metric | Score |
| :--- | :--- |
| **mAP@50** | **92.04%** |
| **mAP@50-95** | **74.85%** |
| **Precision** | **89.56%** |
| **Recall** | **86.56%** |

---

## ⚠️ Model Weights (`best.pt`) Setup

The trained YOLO model weights binary (`best.pt`) is **intentionally excluded from Git** via `.gitignore` to keep the repository lightweight and adhere to best practices for binary assets.

### How to place your model:
1. Download or export your fine-tuned `best.pt` file.
2. Place it directly into the `ml/model/` directory:
   ```
   ml/model/best.pt
   ```
3. The `ml/model/.gitkeep` file ensures the folder structure is maintained in version control. When the FastAPI server starts, it will automatically load `ml/model/best.pt`.

---

## 📁 Project Structure

```
sightassist/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Accessible React UI components (Camera, Detection, Voice)
│   │   ├── services/           # API clients (FastAPI ML & Express)
│   │   ├── utils/              # Speech synthesis, priorities, voice management
│   │   ├── App.jsx             # Main application orchestrator
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # Database connection (MongoDB)
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Mongoose schemas (Settings, DetectionLog)
│   │   ├── routes/             # API routes
│   │   └── server.js           # Server entry point
│   ├── .env.example            # Environment variables template
│   └── package.json
├── ml/                         # FastAPI Python inference service
│   ├── model/
│   │   └── .gitkeep            # Folder placeholder (best.pt placed here)
│   ├── main.py                 # FastAPI app, YOLO loader, /detect endpoint
│   └── requirements.txt        # Python dependencies
├── .gitignore                  # Root Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Start the FastAPI ML Service

```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> Ensure your fine-tuned `best.pt` is placed in `ml/model/best.pt`. The service will listen on `http://127.0.0.1:8000`.

### 2. Start the Express Backend (Optional for standalone ML mode)

```bash
cd server
npm install
npm run dev
```
> The Express server will listen on `http://localhost:5000`.

### 3. Start the React Frontend

```bash
cd client
npm install
npm run dev
```
> Open `http://localhost:5173/` in your browser and click **Start Camera** to begin real-time assistance.

---

## 🔒 Privacy & Safety

- **Zero Cloud Video Storage**: Video frames are captured in browser memory, evaluated by the inference engine, and immediately discarded. No video streams or user photos are permanently stored.
- **Auditory Safety**: Audio guidance utilizes intelligent cooldowns to prevent sensory overload for the user while prioritizing critical, close-range obstacles.
