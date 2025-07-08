/**
 * 🔐 Routes d'Authentification - FusionAI Backend
 * Gestion de l'inscription, connexion, et tokens JWT
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock base de données (remplacer par Prisma/PostgreSQL en production)
const users = [
  {
    id: 1,
    email: 'demo@fusionai.dev',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBc6B4iZ8Q.7PK', // "password"
    name: 'Demo User',
    plan: 'pro',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

let refreshTokens = []; // En production, stocker en Redis

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

// 🔐 Génération des tokens JWT
const generateTokens = (user) => {
  const payload = { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
  });
  
  return { accessToken, refreshToken };
};

// 📝 POST /api/auth/register - Inscription utilisateur
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('plan')
    .optional()
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Plan invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name, plan = 'free' } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Utilisateur existant',
        message: 'Un compte avec cet email existe déjà'
      });
    }
    
    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      plan,
      createdAt: new Date(),
      lastLogin: null
    };
    
    users.push(newUser);
    
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(newUser);
    refreshTokens.push(refreshToken);
    
    res.status(201).json({
      message: '🎉 Inscription réussie !',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
        createdAt: newUser.createdAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

// 🔑 POST /api/auth/login - Connexion utilisateur
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.push(refreshToken);
    
    res.json({
      message: '🎉 Connexion réussie !',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        lastLogin: user.lastLogin
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion'
    });
  }
});

// 🔄 POST /api/auth/refresh - Renouvellement de token
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requis')
], handleValidationErrors, (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Vérifier si le refresh token existe
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Refresh token invalide ou expiré'
      });
    }
    
    // Vérifier et décoder le token
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Supprimer le token invalide
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        return res.status(403).json({
          error: 'Token expiré',
          message: 'Refresh token expiré, veuillez vous reconnecter'
        });
      }
      
      // Trouver l'utilisateur
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur associé au token n\'existe plus'
        });
      }
      
      // Générer de nouveaux tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      
      // Remplacer l'ancien refresh token
      refreshTokens = refreshTokens.filter(token => token !== refreshToken);
      refreshTokens.push(newRefreshToken);
      
      res.json({
        message: '🔄 Token renouvelé avec succès',
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur renouvellement token:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du renouvellement du token'
    });
  }
});

// ✅ POST /api/auth/verify - Vérification de token
router.post('/verify', [
  body('token')
    .notEmpty()
    .withMessage('Token requis')
], handleValidationErrors, (req, res) => {
  try {
    const { token } = req.body;
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: 'Token invalide',
          message: 'Token JWT invalide ou expiré',
          valid: false
        });
      }
      
      // Trouver l'utilisateur
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur associé au token n\'existe plus',
          valid: false
        });
      }
      
      res.json({
        message: '✅ Token valide',
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan
        },
        expiresAt: new Date(decoded.exp * 1000)
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification du token'
    });
  }
});

// 🚪 POST /api/auth/logout - Déconnexion
router.post('/logout', [
  body('refreshToken')
    .optional()
], (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Supprimer le refresh token
      refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    }
    
    res.json({
      message: '👋 Déconnexion réussie !',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la déconnexion'
    });
  }
});

// 📊 GET /api/auth/stats - Statistiques d'authentification
router.get('/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    activeTokens: refreshTokens.length,
    registeredToday: users.filter(u => {
      const today = new Date();
      const userDate = new Date(u.createdAt);
      return userDate.toDateString() === today.toDateString();
    }).length,
    plans: {
      free: users.filter(u => u.plan === 'free').length,
      pro: users.filter(u => u.plan === 'pro').length,
      enterprise: users.filter(u => u.plan === 'enterprise').length
    }
  });
});

module.exports = router;