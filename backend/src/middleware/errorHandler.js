const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données invalides',
      message: err.details[0].message,
      field: err.details[0].path.join('.')
    });
  }

  // Erreur Hedera SDK
  if (err.name === 'StatusError' || err.toString().includes('Hedera')) {
    return res.status(400).json({
      error: 'Erreur Hedera',
      message: 'Erreur lors de l\'interaction avec Hedera Hashgraph',
      details: err.message
    });
  }

  // Erreur IPFS
  if (err.message && err.message.includes('IPFS')) {
    return res.status(500).json({
      error: 'Erreur IPFS',
      message: 'Erreur lors du stockage sur IPFS',
      details: err.message
    });
  }

  // Erreur de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'La taille du fichier dépasse la limite autorisée (10MB)'
    });
  }

  // Erreur de type de fichier
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: 'Type de fichier invalide',
      message: 'Seuls les fichiers image sont autorisés (JPEG, PNG, GIF, WebP)'
    });
  }

  // Erreur de token manquant
  if (err.message === 'Token manquant') {
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Token d\'authentification manquant'
    });
  }

  // Erreur de token invalide
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide'
    });
  }

  // Erreur de token expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Le token d\'authentification a expiré'
    });
  }

  // Erreur de ressource non trouvée
  if (err.message === 'Ressource non trouvée') {
    return res.status(404).json({
      error: 'Ressource non trouvée',
      message: 'La ressource demandée n\'existe pas'
    });
  }

  // Erreur de conflit (ressource déjà existante)
  if (err.message === 'Ressource déjà existante') {
    return res.status(409).json({
      error: 'Conflit',
      message: 'La ressource existe déjà'
    });
  }

  // Erreur de limite de taux dépassée
  if (err.message === 'Rate limit exceeded') {
    return res.status(429).json({
      error: 'Limite de taux dépassée',
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    });
  }

  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Le format JSON de la requête est invalide'
    });
  }

  // Erreur générique du serveur
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Erreur interne du serveur' : 'Erreur',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Une erreur inattendue s\'est produite' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;