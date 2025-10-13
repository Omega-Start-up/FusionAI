const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const institution = await Institution.findById(decoded.id).select('-password');

    if (!institution) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    req.institution = institution;
    next();
  } catch (error) {
    console.error('Erreur auth middleware:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const institution = await Institution.findById(decoded.id).select('-password');

    if (!institution || !institution.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis'
      });
    }

    req.institution = institution;
    next();
  } catch (error) {
    console.error('Erreur admin auth middleware:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

module.exports = { auth, adminAuth };