const { Certificate, tokenCreationSchema, transferSchema } = require('../models/Certificate');
const hederaService = require('../services/hederaService');
const ipfsService = require('../services/ipfsService');
const multer = require('multer');
const config = require('../config/config');

// Configuration multer pour l'upload d'images
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.security.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.security.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'), false);
    }
  }
});

class CertificateController {
  /**
   * Crée un nouveau token NFT pour les certificats
   */
  static async createToken(req, res, next) {
    try {
      console.log('🏗️ Demande de création de token NFT');

      // Validation des données
      const { error, value } = tokenCreationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Données invalides',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { tokenName, tokenSymbol, tokenMemo } = value;

      // Création du token sur Hedera
      const tokenId = await hederaService.createCertificateToken(
        tokenName,
        tokenSymbol,
        tokenMemo
      );

      // Récupération des informations du token
      const tokenInfo = await hederaService.getTokenInfo(tokenId);

      res.status(201).json({
        success: true,
        message: 'Token NFT créé avec succès',
        data: {
          tokenId,
          tokenInfo,
          hashscanUrl: `${config.external.hashscanBaseUrl}/token/${tokenId}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Émet un nouveau certificat sous forme de NFT
   */
  static async issueCertificate(req, res, next) {
    try {
      console.log('🎓 Demande d\'émission de certificat');

      // Création et validation du certificat
      const certificate = new Certificate(req.body);
      const validation = certificate.validate();

      if (!validation.valid) {
        return res.status(400).json({
          error: 'Données du certificat invalides',
          details: validation.errors
        });
      }

      const certificateData = certificate.toJSON();

      // Upload de l'image si fournie
      let imageUrl = certificateData.imageUrl;
      if (req.file) {
        const imageResult = await ipfsService.uploadImage(
          req.file.buffer,
          `certificate-${certificateData.certificateId}.${req.file.originalname.split('.').pop()}`
        );
        imageUrl = imageResult.url;
        certificateData.imageUrl = imageUrl;
      }

      // Upload des métadonnées sur IPFS
      const ipfsResult = await ipfsService.uploadCertificateMetadata(certificateData);

      // Création du token si pas fourni
      let tokenId = req.body.tokenId;
      if (!tokenId) {
        tokenId = await hederaService.createCertificateToken(
          `${certificateData.institutionName} Certificates`,
          'EDU',
          `Certificats de ${certificateData.institutionName}`
        );
      }

      // Mint du NFT
      const nftResult = await hederaService.mintCertificateNFT(
        tokenId,
        ipfsResult.url,
        certificateData
      );

      // Transfert vers le wallet de l'étudiant si spécifié
      let transferResult = null;
      if (certificateData.recipientWalletId) {
        transferResult = await hederaService.transferNFT(
          tokenId,
          nftResult.serial,
          certificateData.recipientWalletId
        );
      }

      res.status(201).json({
        success: true,
        message: 'Certificat émis avec succès',
        data: {
          certificate: certificateData,
          ipfs: {
            hash: ipfsResult.hash,
            url: ipfsResult.url
          },
          nft: nftResult,
          transfer: transferResult,
          verification: {
            url: `${config.server.frontendUrl}/verify/${tokenId}/${nftResult.serial}`,
            hashscanUrl: nftResult.hashscanUrl
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transfère un certificat NFT vers un autre wallet
   */
  static async transferCertificate(req, res, next) {
    try {
      console.log('📤 Demande de transfert de certificat');

      // Validation des données
      const { error, value } = transferSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Données invalides',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { tokenId, serial, recipientAccountId } = value;

      // Transfert du NFT
      const transferResult = await hederaService.transferNFT(
        tokenId,
        serial,
        recipientAccountId
      );

      res.json({
        success: true,
        message: 'Certificat transféré avec succès',
        data: transferResult
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère les informations d'un certificat
   */
  static async getCertificate(req, res, next) {
    try {
      const { tokenId, serial } = req.params;

      console.log(`📋 Récupération du certificat ${tokenId}/${serial}`);

      // Vérification du certificat sur Hedera
      const verification = await hederaService.verifyCertificateNFT(tokenId, serial);

      if (!verification.valid) {
        return res.status(404).json({
          error: 'Certificat non trouvé',
          message: 'Le certificat spécifié n\'existe pas ou n\'est pas valide'
        });
      }

      res.json({
        success: true,
        data: {
          certificate: verification,
          verification: {
            valid: true,
            verifiedAt: new Date().toISOString(),
            blockchain: 'Hedera Hashgraph',
            network: config.hedera.network
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère les métadonnées d'un certificat depuis IPFS
   */
  static async getCertificateMetadata(req, res, next) {
    try {
      const { ipfsHash } = req.params;

      console.log(`📥 Récupération des métadonnées IPFS: ${ipfsHash}`);

      // Récupération depuis IPFS
      const metadata = await ipfsService.getMetadata(ipfsHash);

      // Validation des métadonnées
      const validation = ipfsService.validateMetadata(metadata);

      res.json({
        success: true,
        data: {
          metadata,
          validation,
          ipfsUrl: `${config.ipfs.gatewayUrl}${ipfsHash}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liste les certificats d'une institution (simulation)
   */
  static async listCertificates(req, res, next) {
    try {
      const { institutionId } = req.query;
      const { page = 1, limit = 10 } = req.query;

      console.log(`📚 Liste des certificats pour l'institution: ${institutionId}`);

      // Dans un vrai projet, ceci viendrait d'une base de données
      // Ici nous simulons avec des données d'exemple
      const mockCertificates = [
        {
          tokenId: '0.0.123456',
          serial: '1',
          studentName: 'Benewende Pierre',
          certificateType: 'MASTER',
          fieldOfStudy: 'Intelligence Artificielle',
          institutionName: 'Université de Ouagadougou',
          graduationDate: '2025-10-13',
          hashscanUrl: `${config.external.hashscanBaseUrl}/token/0.0.123456/1`
        }
      ];

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedResults = mockCertificates.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          certificates: paginatedResults,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: mockCertificates.length,
            pages: Math.ceil(mockCertificates.length / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recherche de certificats par critères
   */
  static async searchCertificates(req, res, next) {
    try {
      const { 
        studentName, 
        institutionName, 
        certificateType, 
        fieldOfStudy,
        startDate,
        endDate 
      } = req.query;

      console.log('🔍 Recherche de certificats avec critères:', req.query);

      // Dans un vrai projet, ceci interrogerait une base de données ou un index
      // Ici nous simulons la recherche
      const searchResults = [];

      res.json({
        success: true,
        data: {
          results: searchResults,
          searchCriteria: req.query,
          totalFound: searchResults.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware pour l'upload d'image
   */
  static uploadImage = upload.single('image');

  /**
   * Statistiques des certificats (pour le dashboard)
   */
  static async getStatistics(req, res, next) {
    try {
      console.log('📊 Récupération des statistiques');

      // Dans un vrai projet, ces données viendraient d'une base de données
      const stats = {
        totalCertificates: 1250,
        totalInstitutions: 45,
        totalStudents: 980,
        certificatesThisMonth: 127,
        topInstitutions: [
          { name: 'Université de Ouagadougou', count: 234 },
          { name: 'Institut Supérieur de Technologie', count: 189 },
          { name: 'École Nationale d\'Administration', count: 156 }
        ],
        certificatesByType: {
          DIPLOMA: 456,
          CERTIFICATE: 389,
          BADGE: 234,
          ATTESTATION: 123,
          TRANSCRIPT: 48
        },
        certificatesByLevel: {
          BACHELOR: 567,
          MASTER: 345,
          PHD: 123,
          PROFESSIONAL: 189,
          CONTINUING_EDUCATION: 26
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CertificateController;