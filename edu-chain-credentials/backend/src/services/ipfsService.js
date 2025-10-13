const { create } = require('ipfs-http-client');
const axios = require('axios');

class IPFSService {
  constructor() {
    this.gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    
    // Initialiser le client IPFS
    this.ipfs = create({
      url: process.env.IPFS_API_URL || 'https://api.pinata.cloud',
      headers: {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey
      }
    });
  }

  /**
   * Upload des métadonnées d'un certificat sur IPFS
   * @param {Object} metadata - Métadonnées du certificat
   * @returns {Promise<string>} Hash IPFS
   */
  async uploadMetadata(metadata) {
    try {
      console.log('📤 Upload des métadonnées sur IPFS...');

      // Créer l'objet de métadonnées standardisé
      const certificateMetadata = {
        name: metadata.name,
        description: `Certificat académique de ${metadata.name}`,
        image: metadata.image || `${this.gateway}QmYourDefaultImageHash`,
        external_url: metadata.externalUrl || 'https://edu-chain.dev',
        attributes: [
          {
            trait_type: "Nom",
            value: metadata.name
          },
          {
            trait_type: "Diplôme",
            value: metadata.degree
          },
          {
            trait_type: "Institution",
            value: metadata.institution
          },
          {
            trait_type: "Date d'obtention",
            value: metadata.date
          },
          {
            trait_type: "GPA",
            value: metadata.gpa || "N/A"
          },
          {
            trait_type: "Type de certificat",
            value: "Certificat académique"
          }
        ],
        // Métadonnées personnalisées pour la vérification
        certificate: {
          studentName: metadata.name,
          degree: metadata.degree,
          institution: metadata.institution,
          date: metadata.date,
          gpa: metadata.gpa,
          skills: metadata.skills || [],
          issuer: metadata.issuer || "EduChain Credentials",
          issuerId: metadata.issuerId,
          certificateId: metadata.certificateId,
          verificationUrl: metadata.verificationUrl
        }
      };

      // Convertir en JSON
      const jsonMetadata = JSON.stringify(certificateMetadata, null, 2);
      
      // Upload sur IPFS via Pinata
      const result = await this.uploadToPinata(jsonMetadata, 'certificate-metadata.json');
      
      console.log(`✅ Métadonnées uploadées sur IPFS: ${result.ipfsHash}`);
      return result.ipfsHash;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des métadonnées:', error);
      throw new Error(`Échec de l'upload des métadonnées: ${error.message}`);
    }
  }

  /**
   * Upload d'un fichier sur IPFS via Pinata
   * @param {string|Buffer} content - Contenu à uploader
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<Object>} Résultat de l'upload
   */
  async uploadToPinata(content, fileName) {
    try {
      const formData = new FormData();
      
      // Créer un blob à partir du contenu
      const blob = new Blob([content], { type: 'application/json' });
      formData.append('file', blob, fileName);
      
      // Métadonnées Pinata
      const pinataMetadata = {
        name: fileName,
        keyvalues: {
          type: 'certificate-metadata',
          timestamp: new Date().toISOString()
        }
      };
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      
      // Options Pinata
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      };
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp
      };
    } catch (error) {
      console.error('❌ Erreur Pinata:', error.response?.data || error.message);
      throw new Error(`Échec de l'upload Pinata: ${error.message}`);
    }
  }

  /**
   * Récupérer les métadonnées depuis IPFS
   * @param {string} ipfsHash - Hash IPFS
   * @returns {Promise<Object>} Métadonnées du certificat
   */
  async getMetadata(ipfsHash) {
    try {
      console.log(`📥 Récupération des métadonnées depuis IPFS: ${ipfsHash}`);

      const url = `${this.gateway}${ipfsHash}`;
      const response = await axios.get(url);
      
      console.log(`✅ Métadonnées récupérées avec succès`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métadonnées:', error);
      throw new Error(`Échec de la récupération des métadonnées: ${error.message}`);
    }
  }

  /**
   * Vérifier la validité d'un hash IPFS
   * @param {string} ipfsHash - Hash IPFS
   * @returns {Promise<boolean>} Validité du hash
   */
  async validateHash(ipfsHash) {
    try {
      // Vérifier le format du hash (Qm... pour CIDv0 ou bafy... pour CIDv1)
      const cidPattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{52}$/;
      if (!cidPattern.test(ipfsHash)) {
        return false;
      }

      // Tenter de récupérer les métadonnées
      await this.getMetadata(ipfsHash);
      return true;
    } catch (error) {
      console.error('❌ Hash IPFS invalide:', error.message);
      return false;
    }
  }

  /**
   * Obtenir l'URL complète d'un fichier IPFS
   * @param {string} ipfsHash - Hash IPFS
   * @returns {string} URL complète
   */
  getFileUrl(ipfsHash) {
    return `${this.gateway}${ipfsHash}`;
  }

  /**
   * Upload d'une image de certificat
   * @param {Buffer} imageBuffer - Buffer de l'image
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<string>} Hash IPFS de l'image
   */
  async uploadImage(imageBuffer, fileName) {
    try {
      console.log(`📤 Upload de l'image: ${fileName}`);

      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('file', blob, fileName);
      
      const pinataMetadata = {
        name: fileName,
        keyvalues: {
          type: 'certificate-image',
          timestamp: new Date().toISOString()
        }
      };
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      };
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log(`✅ Image uploadée sur IPFS: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', error);
      throw new Error(`Échec de l'upload de l'image: ${error.message}`);
    }
  }

  /**
   * Créer un certificat visuel (template)
   * @param {Object} certificateData - Données du certificat
   * @returns {Promise<string>} Hash IPFS de l'image du certificat
   */
  async generateCertificateImage(certificateData) {
    try {
      console.log('🎨 Génération de l\'image du certificat...');

      // Pour la démo, on utilise un template simple
      // En production, on pourrait utiliser Canvas ou une librairie de génération d'images
      const certificateTemplate = {
        background: '#f8f9fa',
        border: '#007bff',
        title: 'CERTIFICAT ACADÉMIQUE',
        subtitle: 'Certificat de Réussite',
        content: {
          name: certificateData.name,
          degree: certificateData.degree,
          institution: certificateData.institution,
          date: certificateData.date,
          gpa: certificateData.gpa
        },
        footer: 'EduChain Credentials - Certificat décentralisé sur Hedera Hashgraph'
      };

      // Convertir en JSON pour l'instant (en production, générer une vraie image)
      const templateJson = JSON.stringify(certificateTemplate, null, 2);
      const imageHash = await this.uploadToPinata(templateJson, 'certificate-template.json');
      
      console.log(`✅ Template de certificat généré: ${imageHash}`);
      return imageHash;
    } catch (error) {
      console.error('❌ Erreur lors de la génération de l\'image:', error);
      throw new Error(`Échec de la génération de l'image: ${error.message}`);
    }
  }
}

module.exports = new IPFSService();