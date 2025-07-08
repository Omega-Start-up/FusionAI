const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const router = express.Router();

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.md', '.zip', '.rar'];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${extension} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files at once
  }
});

// Mock files database
const files = [
  {
    id: 1,
    originalName: 'project-spec.pdf',
    filename: 'file-1234567890-spec.pdf',
    mimetype: 'application/pdf',
    size: 2048576,
    uploadedAt: new Date('2024-01-15'),
    userId: 1,
    projectId: 1,
    isPublic: false
  },
  {
    id: 2,
    originalName: 'logo.png',
    filename: 'file-1234567891-logo.png',
    mimetype: 'image/png',
    size: 512000,
    uploadedAt: new Date('2024-01-16'),
    userId: 1,
    projectId: 1,
    isPublic: true
  }
];

// Get user's files
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, type, search, limit = 20, offset = 0 } = req.query;
    
    let userFiles = files.filter(f => f.userId === userId);
    
    // Filter by project
    if (projectId) {
      userFiles = userFiles.filter(f => f.projectId === parseInt(projectId));
    }
    
    // Filter by type
    if (type) {
      userFiles = userFiles.filter(f => f.mimetype.startsWith(type));
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      userFiles = userFiles.filter(f => 
        f.originalName.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const total = userFiles.length;
    const paginatedFiles = userFiles.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      files: paginatedFiles,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasNext: parseInt(offset) + parseInt(limit) < total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch files',
      timestamp: new Date().toISOString()
    });
  }
});

// Upload files
router.post('/upload', authMiddleware, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one file to upload',
        timestamp: new Date().toISOString()
      });
    }

    const uploadedFiles = req.files.map(file => {
      const newFile = {
        id: files.length + Math.random(),
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
        userId: req.user.id,
        projectId: req.body.projectId ? parseInt(req.body.projectId) : null,
        isPublic: req.body.isPublic === 'true'
      };
      
      files.push(newFile);
      return newFile;
    });

    res.status(201).json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to upload files',
      timestamp: new Date().toISOString()
    });
  }
});

// Get file by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = files.find(f => f.id === fileId && f.userId === req.user.id);
    
    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with ID ${fileId} does not exist or you don't have access`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      file,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch file',
      timestamp: new Date().toISOString()
    });
  }
});

// Download file
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = files.find(f => f.id === fileId && f.userId === req.user.id);
    
    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with ID ${fileId} does not exist or you don't have access`,
        timestamp: new Date().toISOString()
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    
    try {
      await fs.access(filePath);
      res.download(filePath, file.originalName);
    } catch (error) {
      res.status(404).json({
        error: 'File not found on disk',
        message: 'The requested file could not be found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to download file',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete file
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const fileIndex = files.findIndex(f => f.id === fileId && f.userId === req.user.id);
    
    if (fileIndex === -1) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with ID ${fileId} does not exist or you don't have access`,
        timestamp: new Date().toISOString()
      });
    }
    
    const file = files[fileIndex];
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    
    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete file from disk:', error.message);
    }
    
    // Remove from database
    files.splice(fileIndex, 1);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to delete file',
      timestamp: new Date().toISOString()
    });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'File size exceeds the 10MB limit',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 5 files allowed per upload',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
});

module.exports = router;