/**
 * 👤 Routes Utilisateurs - FusionAI Backend
 * Gestion des profils utilisateurs et statistiques
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock base de données utilisateurs (même référence que auth.js)
const users = [
  {
    id: 1,
    email: 'demo@fusionai.dev',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBc6B4iZ8Q.7PK',
    name: 'Demo User',
    plan: 'pro',
    avatar: null,
    bio: 'Utilisateur de démonstration FusionAI',
    location: 'Paris, France',
    website: 'https://fusionai.dev',
    company: 'FusionAI',
    github: 'fusionai-demo',
    twitter: '@fusionai_dev',
    preferences: {
      theme: 'dark',
      language: 'fr',
      notifications: true,
      autoSave: true
    },
    stats: {
      projectsCreated: 5,
      filesUploaded: 23,
      windowsOpened: 142,
      lastActivity: new Date()
    },
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
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

// 👤 GET /api/users/profile - Profil de l'utilisateur connecté
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le profil utilisateur n\'existe pas'
      });
    }

    // Retourner le profil sans le mot de passe
    const { password, ...userProfile } = user;
    
    res.json({
      message: '✅ Profil récupéré avec succès',
      user: userProfile
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du profil'
    });
  }
});

// 📝 PUT /api/users/profile - Mise à jour du profil
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La bio ne peut pas dépasser 500 caractères'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La localisation ne peut pas dépasser 100 caractères'),
  body('website')
    .optional()
    .isURL()
    .withMessage('URL du site web invalide'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  body('github')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/)
    .withMessage('Nom d\'utilisateur GitHub invalide'),
  body('twitter')
    .optional()
    .trim()
    .matches(/^@?[a-zA-Z0-9_]{1,15}$/)
    .withMessage('Handle Twitter invalide')
], handleValidationErrors, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le profil utilisateur n\'existe pas'
      });
    }

    // Mettre à jour les champs fournis
    const updateFields = ['name', 'bio', 'location', 'website', 'company', 'github', 'twitter'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Retourner le profil mis à jour sans le mot de passe
    const { password, ...updatedProfile } = user;
    
    res.json({
      message: '✅ Profil mis à jour avec succès',
      user: updatedProfile
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du profil'
    });
  }
});

// ⚙️ PUT /api/users/preferences - Mise à jour des préférences
router.put('/preferences', authenticateToken, [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Thème invalide (light, dark, auto)'),
  body('language')
    .optional()
    .isIn(['fr', 'en', 'es', 'de'])
    .withMessage('Langue invalide'),
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('La valeur notifications doit être un booléen'),
  body('autoSave')
    .optional()
    .isBoolean()
    .withMessage('La valeur autoSave doit être un booléen')
], handleValidationErrors, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le profil utilisateur n\'existe pas'
      });
    }

    // Mettre à jour les préférences
    if (!user.preferences) user.preferences = {};
    
    const preferenceFields = ['theme', 'language', 'notifications', 'autoSave'];
    preferenceFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user.preferences[field] = req.body[field];
      }
    });
    
    res.json({
      message: '⚙️ Préférences mises à jour avec succès',
      preferences: user.preferences
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour préférences:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour des préférences'
    });
  }
});

// 📊 GET /api/users/stats - Statistiques de l'utilisateur
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le profil utilisateur n\'existe pas'
      });
    }

    // Calculer des statistiques détaillées
    const stats = {
      ...user.stats,
      memberSince: user.createdAt,
      daysSinceMember: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      plan: user.plan,
      achievements: [
        { name: 'Premier projet', unlocked: user.stats.projectsCreated > 0 },
        { name: 'Utilisateur actif', unlocked: user.stats.windowsOpened > 50 },
        { name: 'Créateur de contenu', unlocked: user.stats.filesUploaded > 10 },
        { name: 'Expert', unlocked: user.stats.projectsCreated > 3 && user.stats.filesUploaded > 20 }
      ],
      weeklyActivity: {
        projectsThisWeek: Math.floor(Math.random() * 3),
        filesThisWeek: Math.floor(Math.random() * 10),
        windowsThisWeek: Math.floor(Math.random() * 50)
      }
    };
    
    res.json({
      message: '📊 Statistiques récupérées avec succès',
      stats
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des statistiques'
    });
  }
});

// 🔄 PUT /api/users/activity - Mise à jour de l'activité
router.put('/activity', authenticateToken, [
  body('action')
    .isIn(['project_created', 'file_uploaded', 'window_opened', 'login'])
    .withMessage('Action invalide'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Les métadonnées doivent être un objet')
], handleValidationErrors, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le profil utilisateur n\'existe pas'
      });
    }

    const { action, metadata = {} } = req.body;

    // Mettre à jour les statistiques selon l'action
    if (!user.stats) user.stats = { projectsCreated: 0, filesUploaded: 0, windowsOpened: 0 };
    
    switch (action) {
      case 'project_created':
        user.stats.projectsCreated += 1;
        break;
      case 'file_uploaded':
        user.stats.filesUploaded += 1;
        break;
      case 'window_opened':
        user.stats.windowsOpened += 1;
        break;
      case 'login':
        user.lastLogin = new Date();
        break;
    }
    
    user.stats.lastActivity = new Date();
    
    res.json({
      message: '🔄 Activité mise à jour avec succès',
      action,
      stats: user.stats
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour activité:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de l\'activité'
    });
  }
});

// 👥 GET /api/users/search - Recherche d'utilisateurs (pour collaboration)
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Recherche invalide',
        message: 'Le terme de recherche doit contenir au moins 2 caractères'
      });
    }

    // Rechercher les utilisateurs par nom ou email (sans mot de passe)
    const searchResults = users
      .filter(user => 
        user.id !== req.user.id && // Exclure l'utilisateur actuel
        (user.name.toLowerCase().includes(q.toLowerCase()) || 
         user.email.toLowerCase().includes(q.toLowerCase()))
      )
      .slice(0, parseInt(limit))
      .map(({ password, ...user }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        company: user.company
      }));
    
    res.json({
      message: `👥 ${searchResults.length} utilisateur(s) trouvé(s)`,
      users: searchResults,
      query: q
    });
    
  } catch (error) {
    console.error('❌ Erreur recherche utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la recherche'
    });
  }
});

// 🗑️ DELETE /api/users/account - Suppression du compte
router.delete('/account', authenticateToken, [
  body('confirmation')
    .equals('DELETE_MY_ACCOUNT')
    .withMessage('Confirmation requise: "DELETE_MY_ACCOUNT"')
], handleValidationErrors, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Le compte utilisateur n\'existe pas'
      });
    }

    // Supprimer l'utilisateur (en production, marquer comme supprimé)
    users.splice(userIndex, 1);
    
    res.json({
      message: '🗑️ Compte supprimé avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression compte:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du compte'
    });
  }
});

module.exports = router;