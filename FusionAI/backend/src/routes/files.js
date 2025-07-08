/**
 * 📄 Routes Fichiers - FusionAI Backend
 * Gestion upload, téléchargement et CRUD des fichiers
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock base de données fichiers
let files = [
  {
    id: 1,
    name: 'app.component.ts',
    originalName: 'app.component.ts',
    size: 1024,
    mimeType: 'text/typescript',
    path: '/uploads/projects/1/app.component.ts',
    projectId: 1,
    userId: 1,
    tags: ['typescript', 'angular', 'component'],
    description: 'Composant principal de l\'application',
    isPublic: false,
    downloadCount: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

// Configuration du stockage avec Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.body.projectId || 'general';
    const uploadPath = path.join(__dirname, '../../uploads/projects', projectId.toString());
    
    // Créer le répertoire s'il n'existe pas
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

// Configuration Multer avec limitations
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // 5 fichiers max par upload
  },
  fileFilter: (req, file, cb) => {
    // Types de fichiers autorisés
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/json', 'text/javascript', 'text/typescript',
      'text/css', 'text/html', 'text/xml',
      'application/zip', 'application/x-zip-compressed',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
    }
  }
});

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

// 📄 GET /api/files - Liste des fichiers de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  try {
    const { projectId, search, mimeType, limit = 20, offset = 0 } = req.query;
    
    let userFiles = files.filter(f => f.userId === req.user.id);

    // Filtrage par projet
    if (projectId) {
      userFiles = userFiles.filter(f => f.projectId === parseInt(projectId));
    }

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      userFiles = userFiles.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower) ||
        f.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrage par type MIME
    if (mimeType) {
      userFiles = userFiles.filter(f => f.mimeType.includes(mimeType));
    }

    // Pagination
    const total = userFiles.length;
    userFiles = userFiles
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({
      message: `📄 ${userFiles.length} fichier(s) récupéré(s)`,
      files: userFiles,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      stats: {
        totalSize: files.filter(f => f.userId === req.user.id)
          .reduce((sum, f) => sum + f.size, 0),
        totalDownloads: files.filter(f => f.userId === req.user.id)
          .reduce((sum, f) => sum + f.downloadCount, 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération fichiers:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des fichiers'
    });
  }
});

// 📄 GET /api/files/:id - Détails d'un fichier
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = files.find(f => f.id === fileId && f.userId === req.user.id);
    
    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
        message: 'Le fichier demandé n\'existe pas'
      });
    }
    
    res.json({
      message: '📄 Fichier récupéré avec succès',
      file
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération fichier:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du fichier'
    });
  }
});

// ⬆️ POST /api/files/upload - Upload de fichiers
router.post('/upload', authenticateToken, upload.array('files', 5), [
  body('projectId')
    .optional()
    .isInt()
    .withMessage('ID de projet invalide'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Les tags doivent être une chaîne séparée par des virgules'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic doit être un booléen')
], handleValidationErrors, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Aucun fichier',
        message: 'Aucun fichier fourni pour l\'upload'
      });
    }

    const { projectId, description = '', tags = '', isPublic = false } = req.body;
    const tagsList = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const uploadedFiles = [];

    for (const file of req.files) {
      const newFile = {
        id: files.length + 1,
        name: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path,
        projectId: projectId ? parseInt(projectId) : null,
        userId: req.user.id,
        tags: tagsList,
        description,
        isPublic: Boolean(isPublic),
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      files.push(newFile);
      uploadedFiles.push(newFile);
    }
    
    res.status(201).json({
      message: `⬆️ ${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles
    });
    
  } catch (error) {
    console.error('❌ Erreur upload fichiers:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'upload des fichiers'
    });
  }
});

// ⬇️ GET /api/files/:id/download - Télécharger un fichier
router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
        message: 'Le fichier demandé n\'existe pas'
      });
    }

    // Vérifier les droits d'accès
    if (file.userId !== req.user.id && !file.isPublic) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas accès à ce fichier'
      });
    }

    // Vérifier si le fichier existe physiquement
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        error: 'Fichier introuvable',
        message: 'Le fichier physique n\'existe plus sur le serveur'
      });
    }

    // Incrémenter le compteur de téléchargements
    file.downloadCount += 1;
    file.updatedAt = new Date();

    // Télécharger le fichier
    res.download(file.path, file.originalName, (err) => {
      if (err) {
        console.error('❌ Erreur téléchargement:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Erreur téléchargement',
            message: 'Une erreur est survenue lors du téléchargement'
          });
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur téléchargement fichier:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du téléchargement du fichier'
    });
  }
});

// 📝 PUT /api/files/:id - Mettre à jour les métadonnées d'un fichier
router.put('/:id', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Le nom doit contenir entre 1 et 255 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic doit être un booléen')
], handleValidationErrors, (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = files.find(f => f.id === fileId && f.userId === req.user.id);
    
    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
        message: 'Le fichier demandé n\'existe pas'
      });
    }

    // Mettre à jour les champs fournis
    const updateFields = ['name', 'description', 'tags', 'isPublic'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        file[field] = req.body[field];
      }
    });
    
    file.updatedAt = new Date();
    
    res.json({
      message: '📝 Fichier mis à jour avec succès',
      file
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour fichier:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du fichier'
    });
  }
});

// 🗑️ DELETE /api/files/:id - Supprimer un fichier
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const fileIndex = files.findIndex(f => f.id === fileId && f.userId === req.user.id);
    
    if (fileIndex === -1) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
        message: 'Le fichier demandé n\'existe pas'
      });
    }

    const file = files[fileIndex];

    // Supprimer le fichier physique
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Supprimer de la base de données
    files.splice(fileIndex, 1);
    
    res.json({
      message: '🗑️ Fichier supprimé avec succès',
      deletedFile: { 
        id: file.id, 
        name: file.originalName, 
        size: file.size 
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression fichier:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du fichier'
    });
  }
});

// 📊 GET /api/files/stats - Statistiques des fichiers
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const userFiles = files.filter(f => f.userId === req.user.id);
    
    const stats = {
      totalFiles: userFiles.length,
      totalSize: userFiles.reduce((sum, f) => sum + f.size, 0),
      totalDownloads: userFiles.reduce((sum, f) => sum + f.downloadCount, 0),
      publicFiles: userFiles.filter(f => f.isPublic).length,
      fileTypes: userFiles.reduce((acc, f) => {
        const type = f.mimeType.split('/')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      projects: userFiles.reduce((acc, f) => {
        if (f.projectId) {
          acc[f.projectId] = (acc[f.projectId] || 0) + 1;
        }
        return acc;
      }, {}),
      recentUploads: userFiles
        .filter(f => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return new Date(f.createdAt) > dayAgo;
        }).length
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

// 🔍 GET /api/files/search - Recherche avancée de fichiers
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { 
      q = '', 
      projectId, 
      mimeType, 
      minSize, 
      maxSize, 
      dateFrom, 
      dateTo,
      limit = 20 
    } = req.query;
    
    let results = files.filter(f => f.userId === req.user.id || f.isPublic);

    // Recherche textuelle
    if (q) {
      const searchLower = q.toLowerCase();
      results = results.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.originalName.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower) ||
        f.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtres avancés
    if (projectId) results = results.filter(f => f.projectId === parseInt(projectId));
    if (mimeType) results = results.filter(f => f.mimeType.includes(mimeType));
    if (minSize) results = results.filter(f => f.size >= parseInt(minSize));
    if (maxSize) results = results.filter(f => f.size <= parseInt(maxSize));
    if (dateFrom) results = results.filter(f => new Date(f.createdAt) >= new Date(dateFrom));
    if (dateTo) results = results.filter(f => new Date(f.createdAt) <= new Date(dateTo));

    // Limiter les résultats
    results = results.slice(0, parseInt(limit));
    
    res.json({
      message: `🔍 ${results.length} fichier(s) trouvé(s)`,
      files: results,
      query: { q, projectId, mimeType, minSize, maxSize, dateFrom, dateTo }
    });
    
  } catch (error) {
    console.error('❌ Erreur recherche fichiers:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la recherche des fichiers'
    });
  }
});

module.exports = router;