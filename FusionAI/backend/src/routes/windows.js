/**
 * 🪟 Routes Fenêtres - FusionAI Backend  
 * Gestion du système de fenêtres dynamiques style Emergent.sh
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock base de données fenêtres
let windows = [
  {
    id: 1,
    userId: 1,
    title: 'Code Editor',
    type: 'code',
    projectId: 1,
    state: 'normal', // normal, minimized, maximized
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    zIndex: 10,
    isActive: true,
    content: {
      filePath: '/src/app/app.component.ts',
      language: 'typescript',
      code: '// Code TypeScript ici...'
    },
    settings: {
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 🔒 Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'accès requis pour cette ressource'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Token d\'accès invalide ou expiré'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// 🔧 Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données fournies ne sont pas valides',
      details: errors.array()
    });
  }
  next();
};

// 🪟 GET /api/windows - Liste des fenêtres de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type, projectId, state } = req.query;
    
    let userWindows = windows.filter(w => w.userId === req.user.id);

    // Filtrage par type
    if (type) {
      userWindows = userWindows.filter(w => w.type === type);
    }

    // Filtrage par projet
    if (projectId) {
      userWindows = userWindows.filter(w => w.projectId === parseInt(projectId));
    }

    // Filtrage par état
    if (state) {
      userWindows = userWindows.filter(w => w.state === state);
    }

    // Trier par z-index décroissant (fenêtre active en premier)
    userWindows.sort((a, b) => b.zIndex - a.zIndex);
    
    res.json({
      message: `🪟 ${userWindows.length} fenêtre(s) récupérée(s)`,
      windows: userWindows,
      stats: {
        total: userWindows.length,
        active: userWindows.filter(w => w.isActive).length,
        minimized: userWindows.filter(w => w.state === 'minimized').length,
        maximized: userWindows.filter(w => w.state === 'maximized').length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération fenêtres:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des fenêtres'
    });
  }
});

// 📄 GET /api/windows/:id - Détails d'une fenêtre
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const window = windows.find(w => w.id === windowId && w.userId === req.user.id);
    
    if (!window) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }
    
    res.json({
      message: '📄 Fenêtre récupérée avec succès',
      window
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la fenêtre'
    });
  }
});

// ➕ POST /api/windows - Créer une nouvelle fenêtre
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre doit contenir entre 1 et 100 caractères'),
  body('type')
    .isIn(['code', 'github', 'database', 'terminal', 'browser', 'files', 'settings'])
    .withMessage('Type de fenêtre invalide'),
  body('projectId')
    .optional()
    .isInt()
    .withMessage('ID de projet invalide'),
  body('position')
    .optional()
    .isObject()
    .withMessage('Position doit être un objet'),
  body('size')
    .optional()
    .isObject()
    .withMessage('Taille doit être un objet'),
  body('content')
    .optional()
    .isObject()
    .withMessage('Contenu doit être un objet')
], handleValidationErrors, (req, res) => {
  try {
    const { 
      title, 
      type, 
      projectId, 
      position = { x: 50, y: 50 }, 
      size = { width: 800, height: 600 }, 
      content = {} 
    } = req.body;
    
    // Calculer le prochain z-index
    const maxZIndex = Math.max(...windows.map(w => w.zIndex), 0);
    
    // Désactiver toutes les autres fenêtres de l'utilisateur
    windows.forEach(w => {
      if (w.userId === req.user.id) {
        w.isActive = false;
      }
    });
    
    const newWindow = {
      id: windows.length + 1,
      userId: req.user.id,
      title,
      type,
      projectId: projectId || null,
      state: 'normal',
      position,
      size,
      zIndex: maxZIndex + 1,
      isActive: true,
      content,
      settings: {
        theme: 'dark',
        fontSize: 14,
        autoSave: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    windows.push(newWindow);
    
    res.status(201).json({
      message: '✅ Fenêtre créée avec succès',
      window: newWindow
    });
    
  } catch (error) {
    console.error('❌ Erreur création fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de la fenêtre'
    });
  }
});

// 📝 PUT /api/windows/:id/state - Mettre à jour l'état d'une fenêtre
router.put('/:id/state', authenticateToken, [
  body('state')
    .optional()
    .isIn(['normal', 'minimized', 'maximized'])
    .withMessage('État invalide (normal, minimized, maximized)'),
  body('position')
    .optional()
    .isObject()
    .withMessage('Position doit être un objet'),
  body('size')
    .optional()
    .isObject()
    .withMessage('Taille doit être un objet'),
  body('zIndex')
    .optional()
    .isInt()
    .withMessage('zIndex doit être un entier'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
], handleValidationErrors, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const window = windows.find(w => w.id === windowId && w.userId === req.user.id);
    
    if (!window) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }

    // Si cette fenêtre devient active, désactiver les autres
    if (req.body.isActive === true) {
      windows.forEach(w => {
        if (w.userId === req.user.id && w.id !== windowId) {
          w.isActive = false;
        }
      });
    }

    // Mettre à jour les champs fournis
    const updateFields = ['state', 'position', 'size', 'zIndex', 'isActive'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        window[field] = req.body[field];
      }
    });
    
    window.updatedAt = new Date();
    
    res.json({
      message: '📝 État de la fenêtre mis à jour avec succès',
      window
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour état fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de l\'état de la fenêtre'
    });
  }
});

// 💾 PUT /api/windows/:id/content - Mettre à jour le contenu d'une fenêtre
router.put('/:id/content', authenticateToken, [
  body('content')
    .isObject()
    .withMessage('Le contenu doit être un objet')
], handleValidationErrors, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const window = windows.find(w => w.id === windowId && w.userId === req.user.id);
    
    if (!window) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }

    // Mettre à jour le contenu
    window.content = { ...window.content, ...req.body.content };
    window.updatedAt = new Date();
    
    res.json({
      message: '💾 Contenu de la fenêtre mis à jour avec succès',
      content: window.content
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour contenu fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du contenu de la fenêtre'
    });
  }
});

// ⚙️ PUT /api/windows/:id/settings - Mettre à jour les paramètres d'une fenêtre
router.put('/:id/settings', authenticateToken, [
  body('settings')
    .isObject()
    .withMessage('Les paramètres doivent être un objet')
], handleValidationErrors, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const window = windows.find(w => w.id === windowId && w.userId === req.user.id);
    
    if (!window) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }

    // Mettre à jour les paramètres
    window.settings = { ...window.settings, ...req.body.settings };
    window.updatedAt = new Date();
    
    res.json({
      message: '⚙️ Paramètres de la fenêtre mis à jour avec succès',
      settings: window.settings
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour paramètres fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour des paramètres de la fenêtre'
    });
  }
});

// 🔄 PUT /api/windows/focus/:id - Mettre le focus sur une fenêtre
router.put('/focus/:id', authenticateToken, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const window = windows.find(w => w.id === windowId && w.userId === req.user.id);
    
    if (!window) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }

    // Désactiver toutes les autres fenêtres
    windows.forEach(w => {
      if (w.userId === req.user.id) {
        w.isActive = false;
      }
    });

    // Activer cette fenêtre et lui donner le z-index le plus élevé
    const maxZIndex = Math.max(...windows.map(w => w.zIndex), 0);
    window.isActive = true;
    window.zIndex = maxZIndex + 1;
    window.updatedAt = new Date();
    
    res.json({
      message: '🔄 Focus mis sur la fenêtre avec succès',
      window
    });
    
  } catch (error) {
    console.error('❌ Erreur focus fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise du focus sur la fenêtre'
    });
  }
});

// 🗑️ DELETE /api/windows/:id - Supprimer une fenêtre
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const windowId = parseInt(req.params.id);
    const windowIndex = windows.findIndex(w => w.id === windowId && w.userId === req.user.id);
    
    if (windowIndex === -1) {
      return res.status(404).json({
        error: 'Fenêtre non trouvée',
        message: 'La fenêtre demandée n\'existe pas'
      });
    }

    const deletedWindow = windows[windowIndex];
    windows.splice(windowIndex, 1);
    
    res.json({
      message: '🗑️ Fenêtre supprimée avec succès',
      deletedWindow: { 
        id: deletedWindow.id, 
        title: deletedWindow.title, 
        type: deletedWindow.type 
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression fenêtre:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression de la fenêtre'
    });
  }
});

// 🧹 DELETE /api/windows - Supprimer toutes les fenêtres de l'utilisateur
router.delete('/', authenticateToken, (req, res) => {
  try {
    const userWindowsCount = windows.filter(w => w.userId === req.user.id).length;
    windows = windows.filter(w => w.userId !== req.user.id);
    
    res.json({
      message: `🧹 ${userWindowsCount} fenêtre(s) supprimée(s) avec succès`,
      deletedCount: userWindowsCount
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression toutes fenêtres:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression des fenêtres'
    });
  }
});

// 📋 GET /api/windows/workspace/layout - Sauvegarder/restaurer layout workspace
router.get('/workspace/layout', authenticateToken, (req, res) => {
  try {
    const userWindows = windows.filter(w => w.userId === req.user.id);
    
    const layout = {
      windows: userWindows.map(w => ({
        id: w.id,
        title: w.title,
        type: w.type,
        projectId: w.projectId,
        state: w.state,
        position: w.position,
        size: w.size,
        zIndex: w.zIndex,
        isActive: w.isActive
      })),
      timestamp: new Date(),
      totalWindows: userWindows.length
    };
    
    res.json({
      message: '📋 Layout workspace récupéré avec succès',
      layout
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération layout:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du layout'
    });
  }
});

module.exports = router;