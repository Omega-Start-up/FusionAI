const Certificate = require('../models/Certificate');
const Institution = require('../models/Institution');
const hederaService = require('../services/hederaService');
const ipfsService = require('../services/ipfsService');
const { validationResult } = require('express-validator');

class CertificateController {
  // Créer un nouveau certificat
  static async createCertificate(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const institution = req.institution;
      const certificateData = req.body;

      console.log(`🎓 Création d'un certificat pour ${certificateData.student.name}`);

      // Préparer les données du certificat
      const certificatePayload = {
        ...certificateData,
        institution: institution._id,
        institution: {
          _id: institution._id,
          name: institution.name,
          address: institution.address,
          contact: institution.contact
        },
        blockchain: {
          network: process.env.HEDERA_NETWORK || 'testnet'
        }
      };

      // Créer le certificat en base
      const certificate = new Certificate(certificatePayload);
      await certificate.save();

      // Ajouter une entrée d'audit
      await certificate.addAuditEntry('created', institution.email, 'Certificat créé');

      console.log(`✅ Certificat créé avec l'ID: ${certificate.certificateId}`);

      res.status(201).json({
        success: true,
        message: 'Certificat créé avec succès',
        data: {
          certificateId: certificate.certificateId,
          serialNumber: certificate.serialNumber,
          status: certificate.status,
          student: certificate.student.name,
          degree: certificate.academic.degree,
          institution: institution.name
        }
      });

    } catch (error) {
      console.error('❌ Erreur création certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du certificat',
        error: error.message
      });
    }
  }

  // Émettre un certificat (mint NFT)
  static async issueCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const institution = req.institution;

      console.log(`🪙 Émission du certificat ${certificateId}`);

      // Récupérer le certificat
      const certificate = await Certificate.findOne({ certificateId });
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      // Vérifier que l'institution peut émettre ce certificat
      if (certificate.institution.toString() !== institution._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à émettre ce certificat'
        });
      }

      // Vérifier le statut
      if (certificate.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Le certificat ne peut pas être émis dans son état actuel'
        });
      }

      // Upload des métadonnées vers IPFS
      console.log('📤 Upload des métadonnées vers IPFS...');
      const ipfsResult = await ipfsService.uploadCertificateMetadata({
        ...certificate.toObject(),
        verificationUrl: `${process.env.FRONTEND_URL}/verify/${certificate.certificateId}`,
        hashScanUrl: `https://${process.env.HEDERA_NETWORK === 'mainnet' ? '' : 'testnet.'}hashscan.io/token/`
      });

      // Créer le NFT sur Hedera
      console.log('🪙 Création du NFT sur Hedera...');
      const nftResult = await hederaService.createCertificateNFT(
        certificate.toObject(),
        ipfsResult.url
      );

      // Mettre à jour le certificat
      certificate.status = 'issued';
      certificate.isVerified = true;
      certificate.verificationDate = new Date();
      certificate.tokenId = nftResult.tokenId;
      certificate.ipfs = {
        hash: ipfsResult.hash,
        url: ipfsResult.url,
        metadata: ipfsResult.metadata
      };
      certificate.blockchain.transactionHash = nftResult.transactionHash;
      certificate.transfer.transferHash = nftResult.transactionHash;
      certificate.transfer.transferDate = new Date();

      await certificate.save();

      // Mettre à jour les statistiques de l'institution
      await institution.updateStats();

      // Ajouter une entrée d'audit
      await certificate.addAuditEntry('issued', institution.email, 'Certificat émis sur la blockchain');

      console.log(`✅ Certificat émis avec succès: ${certificate.tokenId}`);

      res.json({
        success: true,
        message: 'Certificat émis avec succès',
        data: {
          certificateId: certificate.certificateId,
          tokenId: certificate.tokenId,
          serialNumber: certificate.serialNumber,
          ipfsUrl: certificate.ipfs.url,
          hashScanUrl: certificate.hashScanUrl,
          transactionHash: certificate.blockchain.transactionHash,
          status: certificate.status
        }
      });

    } catch (error) {
      console.error('❌ Erreur émission certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'émission du certificat',
        error: error.message
      });
    }
  }

  // Récupérer les certificats d'une institution
  static async getInstitutionCertificates(req, res) {
    try {
      const { institutionId } = req.params;
      const institution = req.institution;
      const { page = 1, limit = 10, status, search } = req.query;

      // Vérifier que l'institution peut voir ces certificats
      if (institution._id.toString() !== institutionId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      const query = { institution: institutionId };
      
      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { 'student.name': { $regex: search, $options: 'i' } },
          { 'student.email': { $regex: search, $options: 'i' } },
          { 'academic.degree': { $regex: search, $options: 'i' } },
          { certificateId: { $regex: search, $options: 'i' } }
        ];
      }

      const certificates = await Certificate.find(query)
        .populate('institution', 'name address contact')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Certificate.countDocuments(query);

      res.json({
        success: true,
        data: {
          certificates,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération certificats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des certificats',
        error: error.message
      });
    }
  }

  // Récupérer les certificats d'un étudiant
  static async getStudentCertificates(req, res) {
    try {
      const { studentEmail } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const certificates = await Certificate.find({ 'student.email': studentEmail })
        .populate('institution', 'name address contact')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Certificate.countDocuments({ 'student.email': studentEmail });

      res.json({
        success: true,
        data: {
          certificates,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération certificats étudiant:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des certificats',
        error: error.message
      });
    }
  }

  // Récupérer un certificat par ID
  static async getCertificateById(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findOne({ certificateId })
        .populate('institution', 'name address contact');

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      res.json({
        success: true,
        data: certificate
      });

    } catch (error) {
      console.error('❌ Erreur récupération certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du certificat',
        error: error.message
      });
    }
  }

  // Vérifier un certificat
  static async verifyCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findOne({ certificateId })
        .populate('institution', 'name address contact');

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé',
          isValid: false
        });
      }

      // Valider le certificat
      const isValid = certificate.validate();

      res.json({
        success: true,
        data: {
          certificate: certificate.getPublicData(),
          isValid,
          verification: {
            url: certificate.verificationUrl,
            hashScanUrl: certificate.hashScanUrl,
            verifiedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur vérification certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du certificat',
        error: error.message
      });
    }
  }

  // Récupérer un certificat par Token ID (public)
  static async getCertificateByTokenId(req, res) {
    try {
      const { tokenId } = req.params;

      const certificate = await Certificate.findOne({ tokenId })
        .populate('institution', 'name address contact');

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      res.json({
        success: true,
        data: certificate.getPublicData()
      });

    } catch (error) {
      console.error('❌ Erreur récupération certificat par token:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du certificat',
        error: error.message
      });
    }
  }

  // Récupérer les métadonnées d'un certificat
  static async getCertificateMetadata(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      if (!certificate.ipfs?.hash) {
        return res.status(404).json({
          success: false,
          message: 'Métadonnées IPFS non disponibles'
        });
      }

      // Récupérer les métadonnées depuis IPFS
      const metadata = await ipfsService.retrieveMetadata(certificate.ipfs.hash);

      res.json({
        success: true,
        data: {
          ipfsHash: certificate.ipfs.hash,
          ipfsUrl: certificate.ipfs.url,
          metadata
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération métadonnées:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des métadonnées',
        error: error.message
      });
    }
  }

  // Révoquer un certificat
  static async revokeCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const { reason } = req.body;
      const institution = req.institution;

      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      if (certificate.institution.toString() !== institution._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à révoquer ce certificat'
        });
      }

      certificate.status = 'revoked';
      certificate.revokedDate = new Date();
      certificate.revokedReason = reason || 'Non spécifié';

      await certificate.save();

      // Ajouter une entrée d'audit
      await certificate.addAuditEntry('revoked', institution.email, `Certificat révoqué: ${reason}`);

      res.json({
        success: true,
        message: 'Certificat révoqué avec succès',
        data: {
          certificateId: certificate.certificateId,
          status: certificate.status,
          revokedDate: certificate.revokedDate,
          reason: certificate.revokedReason
        }
      });

    } catch (error) {
      console.error('❌ Erreur révocation certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la révocation du certificat',
        error: error.message
      });
    }
  }

  // Mettre à jour un certificat
  static async updateCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const updates = req.body;
      const institution = req.institution;

      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificat non trouvé'
        });
      }

      if (certificate.institution.toString() !== institution._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce certificat'
        });
      }

      // Mettre à jour les champs autorisés
      const allowedUpdates = ['metadata', 'status'];
      const updateData = {};
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      Object.assign(certificate, updateData);
      await certificate.save();

      // Ajouter une entrée d'audit
      await certificate.addAuditEntry('updated', institution.email, 'Certificat mis à jour');

      res.json({
        success: true,
        message: 'Certificat mis à jour avec succès',
        data: certificate
      });

    } catch (error) {
      console.error('❌ Erreur mise à jour certificat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du certificat',
        error: error.message
      });
    }
  }
}

module.exports = CertificateController;