/**
 * 📂 Routes Projets - FusionAI Backend
 * Gestion CRUD des projets utilisateurs
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock base de données projets
let projects = [
  {
    id: 1,
    name: 'FusionAI Demo Project',
    description: 'Projet de démonstration pour la plateforme FusionAI',
    technologies: ['Angular', 'Node.js', 'TypeScript', 'PostgreSQL'],
    status: 'active',
    visibility: 'private',
    userId: 1,
    collaborators: [],
    stats: {
      files: 15,
      commits: 23,
      branches: 3,
      lastActivity: new Date()
    },
    settings: {
      autoSave: true,
      linting: true,
      testing: true
    },
    createdAt: new Date('2024-01-15'),
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

// 📂 GET /api/projects - Liste des projets de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, search, limit = 20, offset = 0 } = req.query;
    
    let userProjects = projects.filter(p => 
      p.userId === req.user.id || p.collaborators.includes(req.user.id)
    );

    // Filtrage par statut
    if (status) {
      userProjects = userProjects.filter(p => p.status === status);
    }

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      userProjects = userProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.technologies.some(tech => tech.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const total = userProjects.length;
    userProjects = userProjects
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({
      message: `📂 ${userProjects.length} projet(s) récupéré(s)`,
      projects: userProjects,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération projets:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des projets'
    });
  }
});

// 📄 GET /api/projects/:id - Détails d'un projet
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    // Vérifier les droits d'accès
    if (project.userId !== req.user.id && !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas accès à ce projet'
      });
    }
    
    res.json({
      message: '📄 Projet récupéré avec succès',
      project
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération projet:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du projet'
    });
  }
});

// ➕ POST /api/projects - Créer un nouveau projet
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Les technologies doivent être un tableau'),
  body('visibility')
    .optional()
    .isIn(['private', 'public', 'team'])
    .withMessage('Visibilité invalide (private, public, team)')
], handleValidationErrors, (req, res) => {
  try {
    const { name, description = '', technologies = [], visibility = 'private' } = req.body;
    
    // Vérifier si un projet avec ce nom existe déjà pour l'utilisateur
    const existingProject = projects.find(p => 
      p.userId === req.user.id && 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingProject) {
      return res.status(409).json({
        error: 'Projet existant',
        message: 'Un projet avec ce nom existe déjà'
      });
    }
    
    const newProject = {
      id: projects.length + 1,
      name,
      description,
      technologies,
      status: 'active',
      visibility,
      userId: req.user.id,
      collaborators: [],
      stats: {
        files: 0,
        commits: 0,
        branches: 1,
        lastActivity: new Date()
      },
      settings: {
        autoSave: true,
        linting: true,
        testing: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    projects.push(newProject);
    
    res.status(201).json({
      message: '✅ Projet créé avec succès',
      project: newProject
    });
    
  } catch (error) {
    console.error('❌ Erreur création projet:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du projet'
    });
  }
});

// 📝 PUT /api/projects/:id - Mettre à jour un projet
router.put('/:id', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Les technologies doivent être un tableau'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'draft'])
    .withMessage('Statut invalide (active, archived, draft)'),
  body('visibility')
    .optional()
    .isIn(['private', 'public', 'team'])
    .withMessage('Visibilité invalide (private, public, team)')
], handleValidationErrors, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    // Vérifier les droits de modification (propriétaire uniquement)
    if (project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seul le propriétaire peut modifier ce projet'
      });
    }

    // Mettre à jour les champs fournis
    const updateFields = ['name', 'description', 'technologies', 'status', 'visibility'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });
    
    project.updatedAt = new Date();
    
    res.json({
      message: '📝 Projet mis à jour avec succès',
      project
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour projet:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du projet'
    });
  }
});

// 👥 PUT /api/projects/:id/collaborators - Gérer les collaborateurs
router.put('/:id/collaborators', authenticateToken, [
  body('action')
    .isIn(['add', 'remove'])
    .withMessage('Action invalide (add, remove)'),
  body('userId')
    .isInt()
    .withMessage('ID utilisateur invalide')
], handleValidationErrors, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { action, userId } = req.body;
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    // Vérifier les droits (propriétaire uniquement)
    if (project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seul le propriétaire peut gérer les collaborateurs'
      });
    }

    if (action === 'add') {
      if (!project.collaborators.includes(userId)) {
        project.collaborators.push(userId);
      }
    } else if (action === 'remove') {
      project.collaborators = project.collaborators.filter(id => id !== userId);
    }
    
    project.updatedAt = new Date();
    
    res.json({
      message: `👥 Collaborateur ${action === 'add' ? 'ajouté' : 'supprimé'} avec succès`,
      collaborators: project.collaborators
    });
    
  } catch (error) {
    console.error('❌ Erreur gestion collaborateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la gestion des collaborateurs'
    });
  }
});

// ⚙️ PUT /api/projects/:id/settings - Mettre à jour les paramètres
router.put('/:id/settings', authenticateToken, [
  body('autoSave')
    .optional()
    .isBoolean()
    .withMessage('autoSave doit être un booléen'),
  body('linting')
    .optional()
    .isBoolean()
    .withMessage('linting doit être un booléen'),
  body('testing')
    .optional()
    .isBoolean()
    .withMessage('testing doit être un booléen')
], handleValidationErrors, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    // Vérifier les droits d'accès
    if (project.userId !== req.user.id && !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas accès à ce projet'
      });
    }

    // Mettre à jour les paramètres
    const settingsFields = ['autoSave', 'linting', 'testing'];
    settingsFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project.settings[field] = req.body[field];
      }
    });
    
    project.updatedAt = new Date();
    
    res.json({
      message: '⚙️ Paramètres mis à jour avec succès',
      settings: project.settings
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour paramètres:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour des paramètres'
    });
  }
});

// 🗑️ DELETE /api/projects/:id - Supprimer un projet
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    const project = projects[projectIndex];

    // Vérifier les droits (propriétaire uniquement)
    if (project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seul le propriétaire peut supprimer ce projet'
      });
    }

    projects.splice(projectIndex, 1);
    
    res.json({
      message: '🗑️ Projet supprimé avec succès',
      deletedProject: { id: projectId, name: project.name }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression projet:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du projet'
    });
  }
});

// 📊 GET /api/projects/:id/stats - Statistiques du projet
router.get('/:id/stats', authenticateToken, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        message: 'Le projet demandé n\'existe pas'
      });
    }

    // Vérifier les droits d'accès
    if (project.userId !== req.user.id && !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas accès à ce projet'
      });
    }

    // Générer des statistiques détaillées
    const detailedStats = {
      ...project.stats,
      age: Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)),
      contributors: project.collaborators.length + 1, // +1 pour le propriétaire
      activity: {
        daily: Math.floor(Math.random() * 10),
        weekly: Math.floor(Math.random() * 50),
        monthly: Math.floor(Math.random() * 200)
      },
      languages: project.technologies.map(tech => ({
        name: tech,
        percentage: Math.floor(Math.random() * 40) + 10
      }))
    };
    
    res.json({
      message: '📊 Statistiques récupérées avec succès',
      stats: detailedStats
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des statistiques'
    });
  }
});

module.exports = router;