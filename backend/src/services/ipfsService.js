const { create } = require('ipfs-http-client');
const FormData = require('form-data');
const axios = require('axios');

class IPFSService {
  constructor() {
    this.client = this.initializeClient();
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
  }

  initializeClient() {
    try {
      // Configuration pour Infura IPFS
      const auth = 'Basic ' + Buffer.from(
        process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
      ).toString('base64');

      const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth,
        },
      });

      console.log('✅ Client IPFS initialisé avec succès');
      return client;
    } catch (error) {
      console.error('❌ Erreur initialisation IPFS:', error);
      throw new Error('Impossible d\'initialiser le client IPFS');
    }
  }

  async uploadMetadata(metadata) {
    try {
      console.log('📤 Upload des métadonnées vers IPFS...');
      
      // Convertir les métadonnées en JSON
      const jsonMetadata = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(jsonMetadata, 'utf8');
      
      // Upload vers IPFS
      const result = await this.client.add(buffer, {
        pin: true,
        cidVersion: 1
      });
      
      const ipfsHash = result.cid.toString();
      const ipfsUrl = `${this.gatewayUrl}${ipfsHash}`;
      
      console.log(`✅ Métadonnées uploadées: ${ipfsUrl}`);
      
      return {
        hash: ipfsHash,
        url: ipfsUrl,
        size: result.size
      };
      
    } catch (error) {
      console.error('❌ Erreur upload IPFS:', error);
      throw new Error(`Erreur upload IPFS: ${error.message}`);
    }
  }

  async uploadFile(fileBuffer, filename) {
    try {
      console.log(`📤 Upload du fichier ${filename} vers IPFS...`);
      
      const result = await this.client.add(fileBuffer, {
        pin: true,
        cidVersion: 1
      });
      
      const ipfsHash = result.cid.toString();
      const ipfsUrl = `${this.gatewayUrl}${ipfsHash}`;
      
      console.log(`✅ Fichier uploadé: ${ipfsUrl}`);
      
      return {
        hash: ipfsHash,
        url: ipfsUrl,
        size: result.size,
        filename
      };
      
    } catch (error) {
      console.error('❌ Erreur upload fichier IPFS:', error);
      throw new Error(`Erreur upload fichier: ${error.message}`);
    }
  }

  async uploadCertificateMetadata(certificateData) {
    try {
      console.log('🎓 Upload des métadonnées du certificat...');
      
      // Structure des métadonnées pour le certificat
      const certificateMetadata = {
        name: `${certificateData.student.name} - ${certificateData.academic.degree}`,
        description: `Certificat académique délivré par ${certificateData.institution.name}`,
        image: certificateData.image || `${this.gatewayUrl}QmDefaultCertificateImage`,
        external_url: certificateData.verificationUrl || '',
        attributes: [
          {
            trait_type: 'Student Name',
            value: certificateData.student.name
          },
          {
            trait_type: 'Degree',
            value: certificateData.academic.degree
          },
          {
            trait_type: 'Field',
            value: certificateData.academic.field
          },
          {
            trait_type: 'Level',
            value: certificateData.academic.level
          },
          {
            trait_type: 'Institution',
            value: certificateData.institution.name
          },
          {
            trait_type: 'Graduation Date',
            value: certificateData.academic.graduationDate
          },
          {
            trait_type: 'GPA',
            value: certificateData.academic.gpa?.toString() || 'N/A'
          },
          {
            trait_type: 'Honors',
            value: certificateData.academic.honors || 'N/A'
          },
          {
            trait_type: 'Certificate ID',
            value: certificateData.certificateId
          },
          {
            trait_type: 'Serial Number',
            value: certificateData.serialNumber
          }
        ],
        // Métadonnées additionnelles pour la vérification
        certificate: {
          id: certificateData.certificateId,
          serialNumber: certificateData.serialNumber,
          student: {
            name: certificateData.student.name,
            email: certificateData.student.email,
            studentId: certificateData.student.studentId,
            dateOfBirth: certificateData.student.dateOfBirth
          },
          academic: {
            degree: certificateData.academic.degree,
            field: certificateData.academic.field,
            level: certificateData.academic.level,
            gpa: certificateData.academic.gpa,
            graduationDate: certificateData.academic.graduationDate,
            honors: certificateData.academic.honors
          },
          institution: {
            name: certificateData.institution.name,
            address: certificateData.institution.address,
            contact: certificateData.institution.contact
          },
          blockchain: {
            network: certificateData.blockchain?.network || 'testnet',
            tokenId: certificateData.tokenId,
            transactionHash: certificateData.blockchain?.transactionHash
          },
          verification: {
            url: certificateData.verificationUrl,
            hashScanUrl: certificateData.hashScanUrl,
            isValid: true,
            issuedAt: new Date().toISOString()
          }
        }
      };
      
      // Upload vers IPFS
      const result = await this.uploadMetadata(certificateMetadata);
      
      return {
        ...result,
        metadata: certificateMetadata
      };
      
    } catch (error) {
      console.error('❌ Erreur upload métadonnées certificat:', error);
      throw new Error(`Erreur upload certificat: ${error.message}`);
    }
  }

  async retrieveMetadata(ipfsHash) {
    try {
      console.log(`📥 Récupération des métadonnées depuis IPFS: ${ipfsHash}`);
      
      const chunks = [];
      for await (const chunk of this.client.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks);
      const metadata = JSON.parse(data.toString());
      
      console.log('✅ Métadonnées récupérées avec succès');
      
      return metadata;
      
    } catch (error) {
      console.error('❌ Erreur récupération IPFS:', error);
      throw new Error(`Erreur récupération IPFS: ${error.message}`);
    }
  }

  async pinContent(ipfsHash) {
    try {
      console.log(`📌 Épinglage du contenu IPFS: ${ipfsHash}`);
      
      await this.client.pin.add(ipfsHash);
      
      console.log('✅ Contenu épinglé avec succès');
      
      return {
        hash: ipfsHash,
        pinned: true
      };
      
    } catch (error) {
      console.error('❌ Erreur épinglage IPFS:', error);
      throw new Error(`Erreur épinglage: ${error.message}`);
    }
  }

  async unpinContent(ipfsHash) {
    try {
      console.log(`📌 Désépinglage du contenu IPFS: ${ipfsHash}`);
      
      await this.client.pin.rm(ipfsHash);
      
      console.log('✅ Contenu désépinglé avec succès');
      
      return {
        hash: ipfsHash,
        pinned: false
      };
      
    } catch (error) {
      console.error('❌ Erreur désépinglage IPFS:', error);
      throw new Error(`Erreur désépinglage: ${error.message}`);
    }
  }

  async getContentInfo(ipfsHash) {
    try {
      console.log(`ℹ️ Récupération des infos du contenu IPFS: ${ipfsHash}`);
      
      const stats = await this.client.stat(ipfsHash);
      
      return {
        hash: ipfsHash,
        size: stats.size,
        cumulativeSize: stats.cumulativeSize,
        blocks: stats.blocks,
        type: stats.type
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération infos IPFS:', error);
      throw new Error(`Erreur infos IPFS: ${error.message}`);
    }
  }

  // Méthode pour valider l'URL IPFS
  isValidIPFSUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('ipfs') || urlObj.pathname.startsWith('/ipfs/');
    } catch {
      return false;
    }
  }

  // Méthode pour extraire le hash IPFS d'une URL
  extractIPFSHash(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.startsWith('/ipfs/')) {
        return urlObj.pathname.replace('/ipfs/', '');
      }
      return null;
    } catch {
      return null;
    }
  }
}

module.exports = new IPFSService();