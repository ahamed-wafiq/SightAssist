import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, voiceEnabled, language } = req.body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 2. Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // 3. Hash the password with bcrypt (never store plain text)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create and save the new user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      voiceEnabled: voiceEnabled !== undefined ? Boolean(voiceEnabled) : true,
      language: language ? String(language).trim() : 'en',
    });

    const savedUser = await newUser.save();

    // 5. Respond with created user data (excluding password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        voiceEnabled: savedUser.voiceEnabled,
        language: savedUser.language,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    // Handle potential duplicate key error from MongoDB index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // 2. Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Compare submitted password with bcrypt password hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Generate JWT signed token
    const jwtSecret = process.env.JWT_SECRET || 'sightassist_jwt_secret_key_secure_2026';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 5. Return success, token, and user info (without password hash)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        voiceEnabled: user.voiceEnabled,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/users/me
 * @access  Private (Protected by JWT middleware)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authMiddleware (protect)
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        voiceEnabled: req.user.voiceEnabled,
        language: req.user.language,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
