import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import detectionRoutes from './routes/detectionRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow client connections in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/emergency', emergencyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SightAssist API Server',
    description: 'AI-powered camera assistant backend for visually impaired users',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      detections: '/api/detections',
      recentDetections: '/api/detections/recent',
      settings: '/api/settings',
      emergencyContacts: '/api/emergency/contacts',
      emergencyTrigger: '/api/emergency/trigger',
    },
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central Error Handler
app.use(errorHandler);

// Start server and connect to MongoDB
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[SightAssist Server] Running on http://localhost:${PORT}`);
    console.log(`[SightAssist Server] Endpoints:`);
    console.log(`  - Health:    http://localhost:${PORT}/api/health`);
    console.log(`  - Detection: http://localhost:${PORT}/api/detections`);
    console.log(`  - Settings:  http://localhost:${PORT}/api/settings`);
    console.log(`  - Emergency: http://localhost:${PORT}/api/emergency/contacts`);
  });
};

startServer();
