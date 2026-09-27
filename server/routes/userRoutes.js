import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users/me
// @desc    Get current user profile (Protected)
// @access  Private
router.get('/me', protect, getCurrentUser);

export default router;

