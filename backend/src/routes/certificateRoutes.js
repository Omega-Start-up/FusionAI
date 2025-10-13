const express = require('express');
const CertificateController = require('../controllers/certificateController');

const router = express.Router();

/**
 * @route POST /api/certificates/token
 * @desc Crée un nouveau token NFT pour les certificats
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.post('/token', CertificateController.createToken);

/**
 * @route POST /api/certificates/issue
 * @desc Émet un nouveau certificat sous forme de NFT
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.post('/issue', 
  CertificateController.uploadImage,
  CertificateController.issueCertificate
);

/**
 * @route POST /api/certificates/transfer
 * @desc Transfère un certificat NFT vers un autre wallet
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.post('/transfer', CertificateController.transferCertificate);

/**
 * @route GET /api/certificates/:tokenId/:serial
 * @desc Récupère les informations d'un certificat spécifique
 * @access Public
 */
router.get('/:tokenId/:serial', CertificateController.getCertificate);

/**
 * @route GET /api/certificates/metadata/:ipfsHash
 * @desc Récupère les métadonnées d'un certificat depuis IPFS
 * @access Public
 */
router.get('/metadata/:ipfsHash', CertificateController.getCertificateMetadata);

/**
 * @route GET /api/certificates
 * @desc Liste les certificats avec pagination et filtres
 * @access Public
 * @query {string} institutionId - ID de l'institution
 * @query {number} page - Numéro de page (défaut: 1)
 * @query {number} limit - Nombre d'éléments par page (défaut: 10)
 */
router.get('/', CertificateController.listCertificates);

/**
 * @route GET /api/certificates/search
 * @desc Recherche de certificats par critères
 * @access Public
 * @query {string} studentName - Nom de l'étudiant
 * @query {string} institutionName - Nom de l'institution
 * @query {string} certificateType - Type de certificat
 * @query {string} fieldOfStudy - Domaine d'étude
 * @query {string} startDate - Date de début (ISO)
 * @query {string} endDate - Date de fin (ISO)
 */
router.get('/search', CertificateController.searchCertificates);

/**
 * @route GET /api/certificates/stats
 * @desc Récupère les statistiques des certificats
 * @access Public (dans un vrai projet, ceci serait protégé)
 */
router.get('/stats', CertificateController.getStatistics);

module.exports = router;