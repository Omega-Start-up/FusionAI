const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const CertificateController = require('../controllers/certificateController');

const router = express.Router();

// Validation rules
const createCertificateValidation = [
  body('student.name').notEmpty().withMessage('Le nom de l\'étudiant est requis'),
  body('student.email').isEmail().withMessage('Email étudiant invalide'),
  body('student.studentId').notEmpty().withMessage('L\'ID étudiant est requis'),
  body('student.dateOfBirth').isISO8601().withMessage('Date de naissance invalide'),
  body('academic.degree').notEmpty().withMessage('Le diplôme est requis'),
  body('academic.field').notEmpty().withMessage('Le domaine d\'étude est requis'),
  body('academic.level').isIn(['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Other']).withMessage('Niveau académique invalide'),
  body('academic.graduationDate').isISO8601().withMessage('Date de graduation invalide'),
  body('academic.gpa').optional().isFloat({ min: 0, max: 4 }).withMessage('GPA invalide'),
  body('academic.honors').optional().isIn(['Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'With Distinction', 'Pass', '']),
  body('transfer.toWallet').notEmpty().withMessage('L\'adresse du wallet est requise'),
  body('metadata.description').optional().isLength({ max: 500 }).withMessage('Description trop longue'),
  body('metadata.tags').optional().isArray().withMessage('Les tags doivent être un tableau')
];

const updateCertificateValidation = [
  body('status').optional().isIn(['pending', 'issued', 'revoked', 'expired']).withMessage('Statut invalide'),
  body('metadata.description').optional().isLength({ max: 500 }).withMessage('Description trop longue'),
  body('metadata.tags').optional().isArray().withMessage('Les tags doivent être un tableau')
];

// Routes
router.post('/create', auth, createCertificateValidation, CertificateController.createCertificate);
router.get('/institution/:institutionId', auth, CertificateController.getInstitutionCertificates);
router.get('/student/:studentEmail', CertificateController.getStudentCertificates);
router.get('/:certificateId', CertificateController.getCertificateById);
router.put('/:certificateId', auth, updateCertificateValidation, CertificateController.updateCertificate);
router.post('/:certificateId/issue', auth, CertificateController.issueCertificate);
router.post('/:certificateId/revoke', auth, CertificateController.revokeCertificate);
router.get('/:certificateId/verify', CertificateController.verifyCertificate);
router.get('/:certificateId/metadata', CertificateController.getCertificateMetadata);

// Routes publiques pour la vérification
router.get('/verify/:certificateId', CertificateController.verifyCertificate);
router.get('/public/:tokenId', CertificateController.getCertificateByTokenId);

module.exports = router;