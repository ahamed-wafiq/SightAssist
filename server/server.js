import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SightAssist server',
  });
});

// User API Routes
app.use('/api/users', userRoutes);

// Mount optional existing client routes if present (for settings, detections, emergency)
try {
  const { default: settingsRoutes } = await import('./src/routes/settingsRoutes.js');
  app.use('/api/settings', settingsRoutes);
} catch (_) {}

try {
  const { default: detectionRoutes } = await import('./src/routes/detectionRoutes.js');
  app.use('/api/detections', detectionRoutes);
} catch (_) {}

try {
  const { default: emergencyRoutes } = await import('./src/routes/emergencyRoutes.js');
  app.use('/api/emergency', emergencyRoutes);
} catch (_) {}

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('[Error] MONGODB_URI is not defined in your .env file.');
      process.exit(1);
    }

    console.log('[Database] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Database] Connected to MongoDB Atlas successfully.');

    app.listen(PORT, () => {
      console.log(`[SightAssist Server] Running on http://localhost:${PORT}`);
      console.log(`[SightAssist Server] Registration: POST http://localhost:${PORT}/api/users/register`);
      console.log(`[SightAssist Server] Login:        POST http://localhost:${PORT}/api/users/login`);
      console.log(`[SightAssist Server] Profile:      GET  http://localhost:${PORT}/api/users/me (Protected)`);
    });
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
