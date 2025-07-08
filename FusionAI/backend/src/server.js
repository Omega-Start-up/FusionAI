/**
 * 🔶 FusionAI Backend Server
 * Serveur Express principal avec authentification JWT, Socket.IO et sécurité renforcée
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const windowRoutes = require('./routes/windows');
const fileRoutes = require('./routes/files');

// 🚀 Configuration du serveur
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 🛡️ Sécurité avec Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// 🌐 Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:3000',
      'https://fusionai.dev',
      'https://www.fusionai.dev',
      process.env.FRONTEND_URL
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 🔒 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: 15 * 60 // en secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 📊 Compression et logging
app.use(compression());
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 🔧 Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📁 Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🏥 Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 FusionAI Backend est en ligne !',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      projects: '/api/projects',
      windows: '/api/windows',
      files: '/api/files'
    }
  });
});

// 🏠 Route racine avec documentation
app.get('/', (req, res) => {
  res.json({
    name: '🚀 FusionAI Backend API',
    version: '1.0.0',
    description: 'API backend pour FusionAI - Plateforme de développement moderne',
    documentation: 'https://docs.fusionai.dev',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects', 
      windows: '/api/windows',
      files: '/api/files'
    },
    inspiration: [
      '🎨 UI/UX de Cursor',
      '⚡ Fenêtres dynamiques d\'Emergent.sh',
      '✨ Design épuré de Lovable.dev'
    ],
    features: [
      '🔐 Authentification JWT',
      '📂 Gestion de projets',
      '🪟 Système de fenêtres',
      '📄 Upload de fichiers',
      '🔒 Sécurité renforcée',
      '⚡ API REST rapide'
    ]
  });
});

// 🛣️ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/windows', windowRoutes);
app.use('/api/files', fileRoutes);

// 🔧 Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Token JWT invalide ou manquant'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'La taille du fichier dépasse la limite autorisée'
    });
  }
  
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 🔍 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    message: `La route ${req.originalUrl} n'existe pas`,
    availableEndpoints: [
      '/health',
      '/api/auth',
      '/api/users',
      '/api/projects',
      '/api/windows', 
      '/api/files'
    ]
  });
});

// 🚀 Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`
🚀 ======================================
   FusionAI Backend démarré avec succès !
======================================
🌐 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/
🔧 Environment: ${NODE_ENV}
📁 Static files: /uploads
⏰ Timestamp: ${new Date().toLocaleString('fr-FR')}
======================================
  `);
});

// 🔧 Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('📟 Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('🔴 Serveur arrêté.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📟 Signal SIGINT reçu, arrêt du serveur...');
  server.close(() => {
    console.log('🔴 Serveur arrêté.');
    process.exit(0);
  });
});

module.exports = app;