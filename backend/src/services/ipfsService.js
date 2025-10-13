const { create } = require('ipfs-http-client');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class IPFSService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  /**
   * Initialise le client IPFS
   */
  initialize() {
    try {
      // Configuration du client IPFS avec authentification Infura
      const auth = config.ipfs.apiKey && config.ipfs.apiSecret ? 
        'Basic ' + Buffer.from(config.ipfs.apiKey + ':' + config.ipfs.apiSecret).toString('base64') : 
        null;

      this.client = create({
        url: config.ipfs.apiUrl,
        headers: auth ? { authorization: auth } : {},
        timeout: config.ipfs.timeout
      });

      console.log('✅ Client IPFS initialisé');
      console.log(`🔗 Gateway: ${config.ipfs.gatewayUrl}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du client IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload les métadonnées d'un certificat sur IPFS
   * @param {Object} certificateData - Données du certificat
   * @returns {Promise<Object>} - Hash IPFS et URL
   */
  async uploadCertificateMetadata(certificateData) {
    try {
      console.log('📤 Upload des métadonnées sur IPFS...');

      // Création des métadonnées au format standard
      const metadata = this.createMetadata(certificateData);

      // Upload sur IPFS
      const result = await this.client.add(JSON.stringify(metadata, null, 2));
      const ipfsHash = result.cid.toString();
      const ipfsUrl = `${config.ipfs.gatewayUrl}${ipfsHash}`;

      console.log(`✅ Métadonnées uploadées sur IPFS: ${ipfsHash}`);

      return {
        hash: ipfsHash,
        url: ipfsUrl,
        metadata,
        size: result.size
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload sur IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload une image sur IPFS
   * @param {Buffer} imageBuffer - Buffer de l'image
   * @param {string} filename - Nom du fichier
   * @returns {Promise<Object>} - Hash IPFS et URL de l'image
   */
  async uploadImage(imageBuffer, filename) {
    try {
      console.log(`📷 Upload de l'image ${filename} sur IPFS...`);

      const result = await this.client.add({
        path: filename,
        content: imageBuffer
      });

      const ipfsHash = result.cid.toString();
      const imageUrl = `${config.ipfs.gatewayUrl}${ipfsHash}`;

      console.log(`✅ Image uploadée sur IPFS: ${ipfsHash}`);

      return {
        hash: ipfsHash,
        url: imageUrl,
        filename,
        size: result.size
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image sur IPFS:', error);
      throw error;
    }
  }

  /**
   * Récupère les métadonnées depuis IPFS
   * @param {string} ipfsHash - Hash IPFS
   * @returns {Promise<Object>} - Métadonnées récupérées
   */
  async getMetadata(ipfsHash) {
    try {
      console.log(`📥 Récupération des métadonnées depuis IPFS: ${ipfsHash}`);

      const url = `${config.ipfs.gatewayUrl}${ipfsHash}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const metadata = await response.json();
      console.log('✅ Métadonnées récupérées depuis IPFS');

      return metadata;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération depuis IPFS:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier existe sur IPFS
   * @param {string} ipfsHash - Hash IPFS
   * @returns {Promise<boolean>} - Existence du fichier
   */
  async fileExists(ipfsHash) {
    try {
      const url = `${config.ipfs.gatewayUrl}${ipfsHash}`;
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du fichier IPFS:', error);
      return false;
    }
  }

  /**
   * Crée les métadonnées standardisées pour un certificat
   * @param {Object} certificateData - Données du certificat
   * @returns {Object} - Métadonnées formatées
   */
  createMetadata(certificateData) {
    const certificateId = certificateData.certificateId || uuidv4();
    const createdAt = new Date().toISOString();

    return {
      // Métadonnées NFT standard (ERC-721/HIP-412)
      name: `${certificateData.certificateType} - ${certificateData.studentName}`,
      description: `Certificat ${certificateData.certificateType} en ${certificateData.fieldOfStudy} délivré par ${certificateData.institutionName} à ${certificateData.studentName}`,
      image: certificateData.imageUrl || '',
      external_url: certificateData.externalUrl || '',
      
      // Métadonnées EduChain spécifiques
      ...config.certificate.defaultMetadata,
      
      // Attributs du certificat
      attributes: [
        {
          trait_type: 'Étudiant',
          value: certificateData.studentName
        },
        {
          trait_type: 'Institution',
          value: certificateData.institutionName
        },
        {
          trait_type: 'Type de certificat',
          value: certificateData.certificateType
        },
        {
          trait_type: 'Domaine d\'étude',
          value: certificateData.fieldOfStudy
        },
        {
          trait_type: 'Niveau',
          value: certificateData.level
        },
        {
          trait_type: 'Date d\'obtention',
          value: certificateData.graduationDate
        },
        {
          trait_type: 'Mention',
          value: certificateData.grade || 'Non spécifiée'
        },
        {
          trait_type: 'Langue',
          value: certificateData.language || 'Français'
        },
        {
          trait_type: 'Pays',
          value: certificateData.country || 'Non spécifié'
        }
      ],

      // Propriétés techniques
      properties: {
        // Identifiants
        certificate_id: certificateId,
        student_id: certificateData.studentId,
        institution_id: certificateData.institutionId,
        
        // Dates
        created_at: createdAt,
        issued_at: certificateData.issuedAt || createdAt,
        graduation_date: certificateData.graduationDate,
        
        // Validation
        verifiable: true,
        blockchain: 'Hedera Hashgraph',
        network: config.hedera.network,
        
        // Métadonnées additionnelles
        duration: certificateData.duration,
        credits: certificateData.credits,
        gpa: certificateData.gpa,
        
        // Signataires
        signatories: certificateData.signatories || [],
        
        // Fichiers associés
        files: {
          certificate_pdf: certificateData.certificatePdfUrl,
          transcript: certificateData.transcriptUrl,
          diploma_supplement: certificateData.diplomaSupplementUrl
        },
        
        // Métadonnées de l'institution
        institution: {
          name: certificateData.institutionName,
          address: certificateData.institutionAddress,
          website: certificateData.institutionWebsite,
          accreditation: certificateData.institutionAccreditation,
          logo_url: certificateData.institutionLogoUrl
        },
        
        // Métadonnées du programme
        program: {
          name: certificateData.programName,
          code: certificateData.programCode,
          department: certificateData.department,
          faculty: certificateData.faculty,
          specialization: certificateData.specialization
        }
      },

      // Métadonnées de conformité
      compliance: {
        gdpr_compliant: true,
        data_retention_policy: '10 years',
        privacy_policy_url: certificateData.privacyPolicyUrl,
        terms_of_service_url: certificateData.termsOfServiceUrl
      },

      // Métadonnées de vérification
      verification: {
        verification_url: `${config.server.frontendUrl}/verify/${certificateId}`,
        qr_code_url: certificateData.qrCodeUrl,
        verification_instructions: 'Visitez le lien de vérification pour confirmer l\'authenticité de ce certificat'
      }
    };
  }

  /**
   * Génère un hash de vérification pour les métadonnées
   * @param {Object} metadata - Métadonnées
   * @returns {string} - Hash de vérification
   */
  generateVerificationHash(metadata) {
    const crypto = require('crypto');
    const dataToHash = JSON.stringify({
      name: metadata.name,
      student: metadata.attributes.find(attr => attr.trait_type === 'Étudiant')?.value,
      institution: metadata.attributes.find(attr => attr.trait_type === 'Institution')?.value,
      graduation_date: metadata.attributes.find(attr => attr.trait_type === 'Date d\'obtention')?.value,
      certificate_type: metadata.attributes.find(attr => attr.trait_type === 'Type de certificat')?.value
    });
    
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  /**
   * Valide les métadonnées d'un certificat
   * @param {Object} metadata - Métadonnées à valider
   * @returns {Object} - Résultat de la validation
   */
  validateMetadata(metadata) {
    const errors = [];
    const warnings = [];

    // Vérifications obligatoires
    if (!metadata.name) errors.push('Le nom du certificat est requis');
    if (!metadata.description) errors.push('La description est requise');
    
    // Vérifications des attributs
    const requiredAttributes = ['Étudiant', 'Institution', 'Type de certificat', 'Date d\'obtention'];
    const presentAttributes = metadata.attributes?.map(attr => attr.trait_type) || [];
    
    requiredAttributes.forEach(attr => {
      if (!presentAttributes.includes(attr)) {
        errors.push(`L'attribut '${attr}' est requis`);
      }
    });

    // Vérifications des propriétés
    if (!metadata.properties?.certificate_id) {
      errors.push('L\'ID du certificat est requis');
    }

    // Avertissements
    if (!metadata.image) warnings.push('Aucune image associée au certificat');
    if (!metadata.properties?.institution?.accreditation) {
      warnings.push('Aucune information d\'accréditation de l\'institution');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = new IPFSService();