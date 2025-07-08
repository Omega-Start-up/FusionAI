const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock projects data
const projects = [
  {
    id: 1,
    name: 'E-commerce App',
    description: 'Application e-commerce complète avec React et Node.js',
    isPublic: false,
    githubUrl: 'https://github.com/demo/ecommerce-app',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'active',
    technologies: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 2,
    name: 'Mobile Dashboard',
    description: 'Dashboard mobile pour la gestion des données',
    isPublic: true,
    githubUrl: 'https://github.com/demo/mobile-dashboard',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'active',
    technologies: ['React Native', 'TypeScript', 'Firebase']
  },
  {
    id: 3,
    name: 'API Gateway',
    description: 'Gateway API pour microservices',
    isPublic: false,
    githubUrl: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'completed',
    technologies: ['Node.js', 'Express', 'Docker']
  }
];

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

// Get all projects
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, search, limit = 10, offset = 0 } = req.query;
    
    let filteredProjects = [...projects];
    
    // Filter by status
    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      projects: paginatedProjects,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasNext: parseInt(offset) + parseInt(limit) < total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch projects',
      timestamp: new Date().toISOString()
    });
  }
});

// Get project by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `Project with ID ${projectId} does not exist`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch project',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new project
router.post('/', [
  authMiddleware,
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('isPublic').optional().isBoolean(),
  body('githubUrl').optional().isURL(),
  body('technologies').optional().isArray()
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
    
    const newProject = {
      id: projects.length + 1,
      name: req.body.name,
      description: req.body.description || '',
      isPublic: req.body.isPublic || false,
      githubUrl: req.body.githubUrl || null,
      technologies: req.body.technologies || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };
    
    projects.push(newProject);
    
    res.status(201).json({
      success: true,
      project: newProject,
      message: 'Project created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to create project',
      timestamp: new Date().toISOString()
    });
  }
});

// Update project
router.put('/:id', [
  authMiddleware,
  body('name').optional().isLength({ min: 2, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('isPublic').optional().isBoolean(),
  body('githubUrl').optional().isURL(),
  body('status').optional().isIn(['active', 'completed', 'archived']),
  body('technologies').optional().isArray()
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
    
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        error: 'Project not found',
        message: `Project with ID ${projectId} does not exist`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update project
    const updatedProject = {
      ...projects[projectIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    projects[projectIndex] = updatedProject;
    
    res.json({
      success: true,
      project: updatedProject,
      message: 'Project updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to update project',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete project
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        error: 'Project not found',
        message: `Project with ID ${projectId} does not exist`,
        timestamp: new Date().toISOString()
      });
    }
    
    projects.splice(projectIndex, 1);
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to delete project',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;