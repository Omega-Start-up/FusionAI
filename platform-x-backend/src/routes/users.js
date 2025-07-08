const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required',
      timestamp: new Date().toISOString()
    });
  }
  
  // In real app, verify JWT token here
  req.user = { id: 1, email: 'demo@platform-x.dev' };
  next();
};

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
  try {
    // Mock user data
    const user = {
      id: 1,
      email: 'demo@platform-x.dev',
      name: 'Demo User',
      subscription: 'pro',
      avatar: null,
      createdAt: new Date('2024-01-01'),
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      stats: {
        projectsCount: 12,
        commitsThisMonth: 156,
        deploymentsCount: 24
      }
    };

    res.json({
      success: true,
      user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch user profile',
      timestamp: new Date().toISOString()
    });
  }
});

// Update user profile
router.put('/profile', [
  authMiddleware,
  body('name').optional().isLength({ min: 2, max: 50 }).trim(),
  body('preferences.theme').optional().isIn(['light', 'dark']),
  body('preferences.language').optional().isIn(['fr', 'en']),
  body('preferences.notifications').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    // Mock update logic
    const updatedUser = {
      id: 1,
      email: 'demo@platform-x.dev',
      name: req.body.name || 'Demo User',
      subscription: 'pro',
      avatar: req.body.avatar || null,
      preferences: {
        theme: req.body.preferences?.theme || 'light',
        language: req.body.preferences?.language || 'fr',
        notifications: req.body.preferences?.notifications !== undefined ? req.body.preferences.notifications : true
      },
      updatedAt: new Date()
    };

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to update user profile',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = {
      projects: {
        total: 12,
        active: 8,
        completed: 4
      },
      activity: {
        commitsThisWeek: 23,
        commitsThisMonth: 156,
        deploymentsThisMonth: 24,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      performance: {
        averageBuildTime: '2m 34s',
        successRate: 98.5,
        uptime: 99.9
      }
    };

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch user statistics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;