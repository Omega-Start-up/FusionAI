const express = require('express');
const { verificationSchema } = require('../models/Certificate');
const hederaService = require('../services/hederaService');
const ipfsService = require('../services/ipfsService');
const config = require('../config/config');

const router = express.Router();

/**
 * @route POST /api/verify
 * @desc Vérifie l'authenticité d'un certificat NFT
 * @access Public
 */
router.post('/', async (req, res, next) => {
  try {
    console.log('🔍 Demande de vérification de certificat');

    // Validation des données
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { tokenId, serial } = value;

    // Vérification sur Hedera
    const verification = await hederaService.verifyCertificateNFT(tokenId, serial);

    if (!verification.valid) {
      return res.status(404).json({
        success: false,
        error: 'Certificat non valide',
        message: 'Le certificat spécifié n\'existe pas ou n\'est pas valide sur la blockchain',
        data: verification
      });
    }

    // Récupération des informations détaillées du token
    const tokenInfo = await hederaService.getTokenInfo(tokenId);

    res.json({
      success: true,
      message: 'Certificat vérifié avec succès',
      data: {
        verification: {
          valid: true,
          tokenId,
          serial,
          verifiedAt: new Date().toISOString(),
          blockchain: 'Hedera Hashgraph',
          network: config.hedera.network
        },
        token: tokenInfo,
        links: {
          hashscan: verification.hashscanUrl,
          mirrorNode: `${config.external.mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts/${serial}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verify/:tokenId/:serial
 * @desc Vérifie un certificat via URL directe (pour QR codes)
 * @access Public
 */
router.get('/:tokenId/:serial', async (req, res, next) => {
  try {
    const { tokenId, serial } = req.params;

    console.log(`🔍 Vérification directe du certificat ${tokenId}/${serial}`);

    // Validation du format des paramètres
    const { error } = verificationSchema.validate({ tokenId, serial });
    if (error) {
      return res.status(400).json({
        error: 'Format invalide',
        message: 'Les paramètres tokenId et serial doivent être au bon format'
      });
    }

    // Vérification sur Hedera
    const verification = await hederaService.verifyCertificateNFT(tokenId, serial);

    if (!verification.valid) {
      return res.status(404).json({
        success: false,
        error: 'Certificat non trouvé',
        message: 'Aucun certificat trouvé avec ces identifiants'
      });
    }

    // Récupération des informations du token
    const tokenInfo = await hederaService.getTokenInfo(tokenId);

    res.json({
      success: true,
      message: 'Certificat trouvé et vérifié',
      data: {
        certificate: {
          tokenId,
          serial,
          nftId: `${tokenId}/${serial}`,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          verifiedAt: new Date().toISOString()
        },
        verification: {
          valid: true,
          blockchain: 'Hedera Hashgraph',
          network: config.hedera.network,
          hashscanUrl: verification.hashscanUrl
        },
        links: {
          hashscan: verification.hashscanUrl,
          mirrorNode: `${config.external.mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts/${serial}`,
          verification: `${config.server.frontendUrl}/verify/${tokenId}/${serial}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/verify/batch
 * @desc Vérifie plusieurs certificats en une seule requête
 * @access Public
 */
router.post('/batch', async (req, res, next) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        error: 'Données invalides',
        message: 'Le champ certificates doit être un tableau non vide'
      });
    }

    if (certificates.length > 50) {
      return res.status(400).json({
        error: 'Limite dépassée',
        message: 'Maximum 50 certificats par requête'
      });
    }

    console.log(`🔍 Vérification en lot de ${certificates.length} certificats`);

    const results = [];

    // Vérification de chaque certificat
    for (const cert of certificates) {
      try {
        const { error } = verificationSchema.validate(cert);
        if (error) {
          results.push({
            tokenId: cert.tokenId,
            serial: cert.serial,
            valid: false,
            error: 'Format invalide',
            message: error.details[0].message
          });
          continue;
        }

        const verification = await hederaService.verifyCertificateNFT(
          cert.tokenId, 
          cert.serial
        );

        results.push({
          tokenId: cert.tokenId,
          serial: cert.serial,
          valid: verification.valid,
          hashscanUrl: verification.hashscanUrl,
          ...(verification.error && { error: verification.error })
        });
      } catch (error) {
        results.push({
          tokenId: cert.tokenId,
          serial: cert.serial,
          valid: false,
          error: 'Erreur de vérification',
          message: error.message
        });
      }
    }

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;

    res.json({
      success: true,
      message: `Vérification terminée: ${validCount} valides, ${invalidCount} invalides`,
      data: {
        results,
        summary: {
          total: results.length,
          valid: validCount,
          invalid: invalidCount,
          verifiedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verify/qr/:tokenId/:serial
 * @desc Génère les données pour un QR code de vérification
 * @access Public
 */
router.get('/qr/:tokenId/:serial', async (req, res, next) => {
  try {
    const { tokenId, serial } = req.params;

    console.log(`📱 Génération QR code pour ${tokenId}/${serial}`);

    // Validation des paramètres
    const { error } = verificationSchema.validate({ tokenId, serial });
    if (error) {
      return res.status(400).json({
        error: 'Format invalide',
        message: 'Les paramètres tokenId et serial doivent être au bon format'
      });
    }

    // URL de vérification
    const verificationUrl = `${config.server.frontendUrl}/verify/${tokenId}/${serial}`;
    const hashscanUrl = `${config.external.hashscanBaseUrl}/token/${tokenId}/${serial}`;

    // Données pour le QR code
    const qrData = {
      type: 'EduChain_Certificate_Verification',
      version: '1.0',
      tokenId,
      serial,
      nftId: `${tokenId}/${serial}`,
      verificationUrl,
      hashscanUrl,
      blockchain: 'Hedera Hashgraph',
      network: config.hedera.network,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        qrData,
        qrString: JSON.stringify(qrData),
        verificationUrl,
        hashscanUrl,
        instructions: {
          fr: 'Scannez ce QR code pour vérifier l\'authenticité du certificat',
          en: 'Scan this QR code to verify the certificate authenticity'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verify/stats
 * @desc Statistiques de vérification
 * @access Public
 */
router.get('/stats', async (req, res, next) => {
  try {
    console.log('📊 Récupération des statistiques de vérification');

    // Dans un vrai projet, ces données viendraient d'une base de données
    const stats = {
      totalVerifications: 5420,
      verificationsToday: 127,
      verificationsThisWeek: 892,
      verificationsThisMonth: 3456,
      successRate: 98.7,
      topVerifiedInstitutions: [
        { name: 'Université de Ouagadougou', verifications: 1234 },
        { name: 'Institut Supérieur de Technologie', verifications: 987 },
        { name: 'École Nationale d\'Administration', verifications: 654 }
      ],
      verificationsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 10
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;