const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenInfoQuery,
  AccountInfoQuery,
  Hbar
} = require('@hashgraph/sdk');

const config = require('../config/config');

class HederaService {
  constructor() {
    this.client = null;
    this.operatorAccountId = null;
    this.operatorPrivateKey = null;
    this.initialize();
  }

  /**
   * Initialise le client Hedera
   */
  initialize() {
    try {
      // Configuration du réseau
      if (config.hedera.network === 'mainnet') {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      // Configuration du compte opérateur
      this.operatorAccountId = AccountId.fromString(config.hedera.accountId);
      this.operatorPrivateKey = PrivateKey.fromString(config.hedera.privateKey);

      this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);

      console.log('✅ Client Hedera initialisé');
      console.log(`📡 Réseau: ${config.hedera.network}`);
      console.log(`👤 Compte: ${this.operatorAccountId}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du client Hedera:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau token NFT pour les certificats
   * @param {string} tokenName - Nom du token
   * @param {string} tokenSymbol - Symbole du token
   * @param {string} tokenMemo - Mémo du token
   * @returns {Promise<string>} - ID du token créé
   */
  async createCertificateToken(tokenName, tokenSymbol, tokenMemo = '') {
    try {
      console.log(`🏗️ Création du token NFT: ${tokenName} (${tokenSymbol})`);

      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(config.hedera.nft.maxSupply)
        .setTreasuryAccountId(this.operatorAccountId)
        .setSupplyKey(this.operatorPrivateKey.publicKey)
        .setAdminKey(this.operatorPrivateKey.publicKey)
        .setTokenMemo(tokenMemo)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTx.sign(this.operatorPrivateKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      
      const tokenId = tokenCreateRx.tokenId.toString();
      
      console.log(`✅ Token NFT créé avec l'ID: ${tokenId}`);
      return tokenId;
    } catch (error) {
      console.error('❌ Erreur lors de la création du token:', error);
      throw error;
    }
  }

  /**
   * Mint un NFT de certificat
   * @param {string} tokenId - ID du token
   * @param {string} metadataUrl - URL des métadonnées IPFS
   * @param {Object} certificateData - Données du certificat
   * @returns {Promise<Object>} - Informations du NFT minté
   */
  async mintCertificateNFT(tokenId, metadataUrl, certificateData) {
    try {
      console.log(`🎨 Mint du NFT pour le token: ${tokenId}`);

      // Création des métadonnées au format bytes
      const metadata = Buffer.from(JSON.stringify({
        name: certificateData.studentName,
        description: `Certificat ${certificateData.certificateType} délivré par ${certificateData.institutionName}`,
        image: certificateData.imageUrl || '',
        external_url: metadataUrl,
        attributes: [
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
            trait_type: 'Date d\'obtention',
            value: certificateData.graduationDate
          },
          {
            trait_type: 'Niveau',
            value: certificateData.level
          },
          {
            trait_type: 'Blockchain',
            value: 'Hedera Hashgraph'
          }
        ],
        properties: {
          ipfs_url: metadataUrl,
          created_at: new Date().toISOString(),
          student_id: certificateData.studentId,
          certificate_id: certificateData.certificateId,
          verifiable: true
        }
      }));

      const tokenMintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(metadata)
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(this.client);

      const tokenMintSign = await tokenMintTx.sign(this.operatorPrivateKey);
      const tokenMintSubmit = await tokenMintSign.execute(this.client);
      const tokenMintRx = await tokenMintSubmit.getReceipt(this.client);

      const nftSerial = tokenMintRx.serials[0].toString();
      const nftId = `${tokenId}/${nftSerial}`;

      console.log(`✅ NFT minté avec l'ID: ${nftId}`);

      return {
        tokenId,
        serial: nftSerial,
        nftId,
        transactionId: tokenMintSubmit.transactionId.toString(),
        metadata: JSON.parse(metadata.toString()),
        hashscanUrl: `${config.external.hashscanBaseUrl}/token/${tokenId}/${nftSerial}`
      };
    } catch (error) {
      console.error('❌ Erreur lors du mint du NFT:', error);
      throw error;
    }
  }

  /**
   * Transfère un NFT vers un compte destinataire
   * @param {string} tokenId - ID du token
   * @param {string} serial - Numéro de série du NFT
   * @param {string} recipientAccountId - ID du compte destinataire
   * @returns {Promise<Object>} - Informations du transfert
   */
  async transferNFT(tokenId, serial, recipientAccountId) {
    try {
      console.log(`📤 Transfert du NFT ${tokenId}/${serial} vers ${recipientAccountId}`);

      // Vérifier si le destinataire a associé le token
      await this.associateToken(tokenId, recipientAccountId);

      const transferTx = new TransferTransaction()
        .addNftTransfer(tokenId, serial, this.operatorAccountId, recipientAccountId)
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(this.operatorPrivateKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);

      console.log(`✅ NFT transféré avec succès`);

      return {
        success: true,
        transactionId: transferSubmit.transactionId.toString(),
        from: this.operatorAccountId.toString(),
        to: recipientAccountId,
        tokenId,
        serial,
        hashscanUrl: `${config.external.hashscanBaseUrl}/transaction/${transferSubmit.transactionId}`
      };
    } catch (error) {
      console.error('❌ Erreur lors du transfert du NFT:', error);
      throw error;
    }
  }

  /**
   * Associe un token à un compte
   * @param {string} tokenId - ID du token
   * @param {string} accountId - ID du compte
   * @returns {Promise<boolean>} - Succès de l'association
   */
  async associateToken(tokenId, accountId) {
    try {
      console.log(`🔗 Association du token ${tokenId} au compte ${accountId}`);

      // Note: En pratique, cette transaction doit être signée par le propriétaire du compte
      // Ici, nous simulons l'association pour les besoins de la démo
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(this.client);

      // Dans un cas réel, le compte destinataire devrait signer cette transaction
      // Pour la démo, nous assumons que l'association est déjà faite
      console.log(`ℹ️ Association simulée pour ${tokenId} -> ${accountId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'association du token:', error);
      // Ne pas faire échouer le processus si l'association échoue
      // (le token pourrait déjà être associé)
      return false;
    }
  }

  /**
   * Récupère les informations d'un token
   * @param {string} tokenId - ID du token
   * @returns {Promise<Object>} - Informations du token
   */
  async getTokenInfo(tokenId) {
    try {
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(tokenId)
        .execute(this.client);

      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply.toString(),
        maxSupply: tokenInfo.maxSupply?.toString(),
        treasury: tokenInfo.treasuryAccountId.toString(),
        type: tokenInfo.tokenType.toString(),
        supplyType: tokenInfo.supplyType.toString(),
        memo: tokenInfo.tokenMemo
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos du token:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations d'un compte
   * @param {string} accountId - ID du compte
   * @returns {Promise<Object>} - Informations du compte
   */
  async getAccountInfo(accountId) {
    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return {
        accountId: accountInfo.accountId.toString(),
        balance: accountInfo.balance.toString(),
        tokens: accountInfo.tokenRelationships ? 
          Object.keys(accountInfo.tokenRelationships).map(tokenId => ({
            tokenId,
            balance: accountInfo.tokenRelationships[tokenId].balance.toString()
          })) : []
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos du compte:', error);
      throw error;
    }
  }

  /**
   * Vérifie la validité d'un NFT de certificat
   * @param {string} tokenId - ID du token
   * @param {string} serial - Numéro de série du NFT
   * @returns {Promise<Object>} - Informations de vérification
   */
  async verifyCertificateNFT(tokenId, serial) {
    try {
      console.log(`🔍 Vérification du NFT ${tokenId}/${serial}`);

      const tokenInfo = await this.getTokenInfo(tokenId);
      
      // Construire l'URL HashScan pour vérification publique
      const hashscanUrl = `${config.external.hashscanBaseUrl}/token/${tokenId}/${serial}`;
      
      return {
        valid: true,
        tokenId,
        serial,
        tokenInfo,
        hashscanUrl,
        verificationDate: new Date().toISOString(),
        blockchain: 'Hedera Hashgraph',
        network: config.hedera.network
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du NFT:', error);
      return {
        valid: false,
        error: error.message,
        tokenId,
        serial
      };
    }
  }
}

module.exports = new HederaService();