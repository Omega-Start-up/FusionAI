const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config/config');
const certificateRoutes = require('./routes/certificateRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Configuration de sécurité
app.use(helmet());
app.use(compression());

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// Middleware de logging
app.use(morgan('combined'));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/health', healthRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/verify', verificationRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: '🎓 EduChain Credentials API',
    version: '1.0.0',
    description: 'API pour la certification académique décentralisée sur Hedera',
    endpoints: {
      health: '/api/health',
      certificates: '/api/certificates',
      institutions: '/api/institutions',
      verification: '/api/verify'
    },
    documentation: 'https://github.com/your-org/educhain-credentials'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 EduChain Credentials API démarré !
📍 Port: ${PORT}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
📚 Documentation: http://localhost:${PORT}/api/health

🎓 Prêt pour la certification académique décentralisée !
  `);
});

module.exports = app;