const express = require('express');
const Joi = require('joi');
const hederaService = require('../services/hederaService');
const config = require('../config/config');

const router = express.Router();

// Schéma de validation pour une institution
const institutionSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  address: Joi.string().max(500).optional(),
  website: Joi.string().uri().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
  country: Joi.string().length(2).optional(),
  accreditation: Joi.string().max(200).optional(),
  logoUrl: Joi.string().uri().optional(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'SCHOOL', 'ACADEMY').optional()
});

/**
 * @route POST /api/institutions
 * @desc Enregistre une nouvelle institution
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.post('/', async (req, res, next) => {
  try {
    console.log('🏛️ Enregistrement d\'une nouvelle institution');

    // Validation des données
    const { error, value } = institutionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const institutionData = value;

    // Génération d'un ID unique pour l'institution
    const { v4: uuidv4 } = require('uuid');
    const institutionId = uuidv4();

    // Création du token NFT pour l'institution
    const tokenId = await hederaService.createCertificateToken(
      `${institutionData.name} Certificates`,
      'EDU',
      `Certificats officiels de ${institutionData.name}`
    );

    // Dans un vrai projet, on sauvegarderait en base de données
    const institution = {
      id: institutionId,
      ...institutionData,
      tokenId,
      createdAt: new Date().toISOString(),
      status: 'active',
      certificatesIssued: 0
    };

    res.status(201).json({
      success: true,
      message: 'Institution enregistrée avec succès',
      data: {
        institution,
        token: {
          tokenId,
          hashscanUrl: `${config.external.hashscanBaseUrl}/token/${tokenId}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/institutions/:id
 * @desc Récupère les informations d'une institution
 * @access Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`🏛️ Récupération de l'institution: ${id}`);

    // Dans un vrai projet, on interrogerait la base de données
    // Ici nous simulons avec des données d'exemple
    const mockInstitution = {
      id,
      name: 'Université de Ouagadougou',
      address: 'Avenue Charles de Gaulle, Ouagadougou, Burkina Faso',
      website: 'https://www.univ-ouaga.bf',
      email: 'contact@univ-ouaga.bf',
      phone: '+226 25 30 70 64',
      country: 'BF',
      accreditation: 'Ministère de l\'Enseignement Supérieur du Burkina Faso',
      logoUrl: 'https://example.com/logo-uo.png',
      description: 'Première université publique du Burkina Faso, fondée en 1974',
      type: 'UNIVERSITY',
      tokenId: '0.0.123456',
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'active',
      certificatesIssued: 1250,
      stats: {
        totalCertificates: 1250,
        certificatesThisYear: 456,
        totalStudents: 980,
        departments: 12,
        programs: 45
      }
    };

    res.json({
      success: true,
      data: mockInstitution
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/institutions
 * @desc Liste toutes les institutions avec pagination
 * @access Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, country, type, search } = req.query;

    console.log('🏛️ Liste des institutions');

    // Dans un vrai projet, ceci viendrait d'une base de données
    const mockInstitutions = [
      {
        id: '1',
        name: 'Université de Ouagadougou',
        country: 'BF',
        type: 'UNIVERSITY',
        certificatesIssued: 1250,
        tokenId: '0.0.123456',
        status: 'active'
      },
      {
        id: '2',
        name: 'Institut Supérieur de Technologie',
        country: 'BF',
        type: 'INSTITUTE',
        certificatesIssued: 890,
        tokenId: '0.0.123457',
        status: 'active'
      },
      {
        id: '3',
        name: 'École Nationale d\'Administration',
        country: 'BF',
        type: 'SCHOOL',
        certificatesIssued: 567,
        tokenId: '0.0.123458',
        status: 'active'
      }
    ];

    // Filtrage simple (dans un vrai projet, ceci serait fait en base)
    let filteredInstitutions = mockInstitutions;

    if (country) {
      filteredInstitutions = filteredInstitutions.filter(inst => 
        inst.country === country.toUpperCase()
      );
    }

    if (type) {
      filteredInstitutions = filteredInstitutions.filter(inst => 
        inst.type === type.toUpperCase()
      );
    }

    if (search) {
      filteredInstitutions = filteredInstitutions.filter(inst => 
        inst.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredInstitutions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        institutions: paginatedResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredInstitutions.length,
          pages: Math.ceil(filteredInstitutions.length / limit)
        },
        filters: {
          country,
          type,
          search
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/institutions/:id
 * @desc Met à jour une institution
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`🏛️ Mise à jour de l'institution: ${id}`);

    // Validation des données
    const { error, value } = institutionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Dans un vrai projet, on mettrait à jour en base de données
    const updatedInstitution = {
      id,
      ...value,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Institution mise à jour avec succès',
      data: updatedInstitution
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/institutions/:id/certificates
 * @desc Récupère les certificats émis par une institution
 * @access Public
 */
router.get('/:id/certificates', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, type, level, year } = req.query;

    console.log(`📚 Certificats de l'institution: ${id}`);

    // Dans un vrai projet, ceci viendrait d'une base de données
    const mockCertificates = [
      {
        tokenId: '0.0.123456',
        serial: '1',
        studentName: 'Benewende Pierre',
        certificateType: 'MASTER',
        fieldOfStudy: 'Intelligence Artificielle',
        graduationDate: '2025-10-13',
        level: 'MASTER',
        hashscanUrl: `${config.external.hashscanBaseUrl}/token/0.0.123456/1`
      }
    ];

    // Filtrage et pagination (simulation)
    let filteredCertificates = mockCertificates;

    if (type) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.certificateType === type.toUpperCase()
      );
    }

    if (level) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.level === level.toUpperCase()
      );
    }

    if (year) {
      filteredCertificates = filteredCertificates.filter(cert => 
        new Date(cert.graduationDate).getFullYear() === parseInt(year)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredCertificates.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        certificates: paginatedResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredCertificates.length,
          pages: Math.ceil(filteredCertificates.length / limit)
        },
        filters: { type, level, year }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/institutions/:id/stats
 * @desc Récupère les statistiques d'une institution
 * @access Public
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`📊 Statistiques de l'institution: ${id}`);

    // Dans un vrai projet, ces données viendraient d'une base de données
    const stats = {
      institutionId: id,
      totalCertificates: 1250,
      certificatesThisYear: 456,
      certificatesThisMonth: 89,
      totalStudents: 980,
      departments: 12,
      programs: 45,
      certificatesByType: {
        DIPLOMA: 567,
        CERTIFICATE: 389,
        BADGE: 234,
        ATTESTATION: 60
      },
      certificatesByLevel: {
        BACHELOR: 567,
        MASTER: 345,
        PHD: 123,
        PROFESSIONAL: 189,
        CONTINUING_EDUCATION: 26
      },
      monthlyIssuance: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: Math.floor(Math.random() * 100) + 20
      })),
      topPrograms: [
        { name: 'Informatique', certificates: 234 },
        { name: 'Gestion', certificates: 189 },
        { name: 'Médecine', certificates: 156 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/institutions/search
 * @desc Recherche d'institutions par nom ou critères
 * @access Public
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, country, type, accredited } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Requête invalide',
        message: 'Le terme de recherche doit contenir au moins 2 caractères'
      });
    }

    console.log(`🔍 Recherche d'institutions: "${q}"`);

    // Dans un vrai projet, ceci utiliserait un moteur de recherche
    const searchResults = [
      {
        id: '1',
        name: 'Université de Ouagadougou',
        country: 'BF',
        type: 'UNIVERSITY',
        accredited: true,
        matchScore: 0.95
      }
    ];

    res.json({
      success: true,
      data: {
        results: searchResults,
        query: q,
        filters: { country, type, accredited },
        totalFound: searchResults.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;