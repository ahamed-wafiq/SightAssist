import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware for Express
 * 
 * Intercepts incoming requests to protected routes.
 * Verifies the JWT Bearer token from the Authorization header.
 * Attaches the authenticated user object (without password hash) to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // Extract token from "Bearer <token>"
      token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token missing',
        });
      }

      // Verify token
      const jwtSecret = process.env.JWT_SECRET || 'sightassist_jwt_secret_key_secure_2026';
      const decoded = jwt.verify(token, jwtSecret);

      // Find user by id and exclude password hash
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or expired',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no Bearer token provided in Authorization header',
    });
  }
};
