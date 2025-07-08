const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock windows state storage
const windowsState = new Map();

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
  req.user = { id: 1, email: 'demo@platform-x.dev' };
  next();
};

// Get user's windows state
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const userWindows = windowsState.get(userId) || [];
    
    res.json({
      success: true,
      windows: userWindows,
      count: userWindows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get windows error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch windows state',
      timestamp: new Date().toISOString()
    });
  }
});

// Save window state
router.post('/state', [
  authMiddleware,
  body('windowId').isString().notEmpty(),
  body('position').isObject(),
  body('position.x').isNumeric(),
  body('position.y').isNumeric(),
  body('size').isObject(),
  body('size.width').isNumeric(),
  body('size.height').isNumeric(),
  body('isMinimized').optional().isBoolean(),
  body('isMaximized').optional().isBoolean(),
  body('isVisible').optional().isBoolean()
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

    const userId = req.user.id;
    const { windowId, position, size, isMinimized = false, isMaximized = false, isVisible = true } = req.body;
    
    let userWindows = windowsState.get(userId) || [];
    
    // Find existing window or create new one
    const windowIndex = userWindows.findIndex(w => w.windowId === windowId);
    const windowState = {
      windowId,
      position,
      size,
      isMinimized,
      isMaximized,
      isVisible,
      updatedAt: new Date().toISOString()
    };

    if (windowIndex !== -1) {
      userWindows[windowIndex] = { ...userWindows[windowIndex], ...windowState };
    } else {
      userWindows.push({
        ...windowState,
        createdAt: new Date().toISOString()
      });
    }

    windowsState.set(userId, userWindows);

    res.json({
      success: true,
      message: 'Window state saved successfully',
      windowState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save window state error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to save window state',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete window state
router.delete('/:windowId', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { windowId } = req.params;
    
    let userWindows = windowsState.get(userId) || [];
    const initialLength = userWindows.length;
    
    userWindows = userWindows.filter(w => w.windowId !== windowId);
    
    if (userWindows.length === initialLength) {
      return res.status(404).json({
        error: 'Window not found',
        message: `Window with ID ${windowId} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    windowsState.set(userId, userWindows);

    res.json({
      success: true,
      message: 'Window state deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete window state error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to delete window state',
      timestamp: new Date().toISOString()
    });
  }
});

// Clear all windows
router.delete('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    windowsState.delete(userId);

    res.json({
      success: true,
      message: 'All window states cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear windows error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to clear window states',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;