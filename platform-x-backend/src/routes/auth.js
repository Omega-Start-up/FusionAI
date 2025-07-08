const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock user database (replace with real database)
const users = [
  {
    id: 1,
    email: 'demo@platform-x.dev',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Demo User',
    subscription: 'pro',
    createdAt: new Date('2024-01-01'),
    avatar: null
  }
];

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2 and 50 characters')
];

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        subscription: user.subscription
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        isAuthenticated: true,
        initials: getInitials(user.name)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login',
      timestamp: new Date().toISOString()
    });
  }
});

// Register route
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name: name.trim(),
      subscription: 'free',
      createdAt: new Date(),
      avatar: null
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        subscription: newUser.subscription
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        isAuthenticated: true,
        initials: getInitials(newUser.name)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during registration',
      timestamp: new Date().toISOString()
    });
  }
});

// Verify token route
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        error: 'Token required',
        message: 'No authentication token provided',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or user no longer exists',
        timestamp: new Date().toISOString()
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        isAuthenticated: true,
        initials: getInitials(user.name)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Authentication token has expired',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is malformed',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(401).json({
      error: 'Token verification failed',
      message: 'Unable to verify authentication token',
      timestamp: new Date().toISOString()
    });
  }
});

// Refresh token route
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        error: 'Token required',
        message: 'No authentication token provided',
        timestamp: new Date().toISOString()
      });
    }

    // Verify the old token (even if expired, we just need to check structure)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed',
        timestamp: new Date().toISOString()
      });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User associated with token no longer exists',
        timestamp: new Date().toISOString()
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        subscription: user.subscription
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token: newToken,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Unable to refresh authentication token',
      timestamp: new Date().toISOString()
    });
  }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString()
  });
});

// Helper function to get user initials
function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

module.exports = router;