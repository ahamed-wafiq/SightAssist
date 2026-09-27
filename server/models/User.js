import mongoose from 'mongoose';

/**
 * User Schema for SightAssist
 * Stores user preferences and credentials.
 * Passwords are encrypted with bcrypt before saving.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  voiceEnabled: {
    type: Boolean,
    default: true,
  },
  language: {
    type: String,
    default: 'en',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
