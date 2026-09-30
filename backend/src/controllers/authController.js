const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper to generate Short-Lived Access Token (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper to generate Long-Lived Refresh Token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }

  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error(`Error in register: ${error.message}`);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & issue tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  // 1. Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }

  try {
    const { email, password } = req.body;

    // 2. Look for the user
    const user = await User.findOne({ email });
    if (!user) {
      // Security Requirement: Generic message, don't reveal which field is wrong
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Save the refresh token to the database for session revocation tracking
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Send Refresh Token as an httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents client-side JS scripts from reading the cookie
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
      sameSite: 'strict', // Protects against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // 7. Send Access Token and User profile details in JSON body response
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error(`Error in login: ${error.message}`);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
// Add these functions below your login logic inside authController.js

// @desc    Refresh access token using the HTTP-Only refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    // 1. Read refresh token from secure httpOnly cookies
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing. Please log in.' });
    }

    // 2. Verify token signature
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // 3. Cross-reference the database record to ensure it hasn't been revoked
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid or revoked refresh token. Re-login required.' });
    }

    // 4. Issue a brand-new short-lived access token
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error(`Refresh Token Error: ${error.message}`);
    return res.status(403).json({ message: 'Expired or invalid refresh token' });
  }
};

// @desc    Logout user & invalidate tokens
// @route   POST /api/auth/logout
// @access  Authenticated
const logout = async (req, res) => {
  try {
    // 1. Clear the refresh token inside the database for the active user session
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // 2. Clear the client cookie profile configuration
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(`Logout Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Authenticated
const getMe = async (req, res) => {
  // req.user was already attached by our authenticate middleware
  return res.status(200).json(req.user);
};

// REMEMBER TO UPDATE YOUR EXPORTS AT THE BOTTOM OF THE FILE:
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  generateAccessToken
};



