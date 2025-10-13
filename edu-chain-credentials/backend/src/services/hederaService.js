const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenInfoQuery,
  Hbar,
  Status
} = require('@hashgraph/sdk');

class HederaService {
  constructor() {
    this.client = this.initializeClient();
    this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    this.privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  }

  initializeClient() {
    const client = Client.forName(process.env.HEDERA_NETWORK || 'testnet');
    client.setOperator(this.accountId, this.privateKey);
    return client;
  }

  /**
   * Créer un nouveau token NFT pour les certificats
   * @param {string} tokenName - Nom du token (ex: "EduCert")
   * @param {string} tokenSymbol - Symbole du token (ex: "EDU")
   * @param {Buffer} metadata - Métadonnées IPFS
   * @returns {Promise<string>} Token ID
   */
  async createNFT(tokenName, tokenSymbol, metadata) {
    try {
      console.log(`🎓 Création du NFT: ${tokenName} (${tokenSymbol})`);

      const tokenCreateTransaction = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(this.accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000000) // Limite maximale de certificats
        .setTokenMemo('Certificat académique décentralisé')
        .setAdminKey(this.privateKey.publicKey)
        .setSupplyKey(this.privateKey.publicKey)
        .setWipeKey(this.privateKey.publicKey)
        .setFreezeKey(this.privateKey.publicKey)
        .setPauseKey(this.privateKey.publicKey)
        .setMetadata(metadata)
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTransaction.sign(this.privateKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);

      const tokenId = tokenCreateReceipt.tokenId.toString();
      console.log(`✅ NFT créé avec succès: ${tokenId}`);

      return tokenId;
    } catch (error) {
      console.error('❌ Erreur lors de la création du NFT:', error);
      throw new Error(`Échec de la création du NFT: ${error.message}`);
    }
  }

  /**
   * Mint un nouveau certificat NFT
   * @param {string} tokenId - ID du token
   * @param {Buffer} metadata - Métadonnées du certificat
   * @returns {Promise<string>} Serial Number du NFT
   */
  async mintCertificate(tokenId, metadata) {
    try {
      console.log(`🎓 Mint du certificat pour le token: ${tokenId}`);

      const tokenMintTransaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadata])
        .freezeWith(this.client);

      const tokenMintSign = await tokenMintTransaction.sign(this.privateKey);
      const tokenMintSubmit = await tokenMintSign.execute(this.client);
      const tokenMintReceipt = await tokenMintSubmit.getReceipt(this.client);

      const serialNumber = tokenMintReceipt.serials[0].toString();
      console.log(`✅ Certificat minté avec succès: Serial ${serialNumber}`);

      return serialNumber;
    } catch (error) {
      console.error('❌ Erreur lors du mint du certificat:', error);
      throw new Error(`Échec du mint du certificat: ${error.message}`);
    }
  }

  /**
   * Transférer un certificat NFT à un étudiant
   * @param {string} tokenId - ID du token
   * @param {string} serialNumber - Numéro de série du NFT
   * @param {string} studentAccountId - Account ID de l'étudiant
   * @returns {Promise<string>} Transaction ID
   */
  async transferCertificate(tokenId, serialNumber, studentAccountId) {
    try {
      console.log(`🎓 Transfert du certificat ${serialNumber} vers ${studentAccountId}`);

      const transferTransaction = new TransferTransaction()
        .addNftTransfer(
          tokenId,
          parseInt(serialNumber),
          this.accountId,
          AccountId.fromString(studentAccountId)
        )
        .freezeWith(this.client);

      const transferSign = await transferTransaction.sign(this.privateKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferReceipt = await transferSubmit.getReceipt(this.client);

      const transactionId = transferReceipt.transactionId.toString();
      console.log(`✅ Certificat transféré avec succès: ${transactionId}`);

      return transactionId;
    } catch (error) {
      console.error('❌ Erreur lors du transfert du certificat:', error);
      throw new Error(`Échec du transfert du certificat: ${error.message}`);
    }
  }

  /**
   * Obtenir les informations d'un token
   * @param {string} tokenId - ID du token
   * @returns {Promise<Object>} Informations du token
   */
  async getTokenInfo(tokenId) {
    try {
      const tokenInfoQuery = new TokenInfoQuery()
        .setTokenId(tokenId);

      const tokenInfo = await tokenInfoQuery.execute(this.client);

      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply.toString(),
        maxSupply: tokenInfo.maxSupply.toString(),
        treasury: tokenInfo.treasuryAccountId.toString(),
        adminKey: tokenInfo.adminKey ? tokenInfo.adminKey.toString() : null,
        supplyKey: tokenInfo.supplyKey ? tokenInfo.supplyKey.toString() : null,
        metadata: tokenInfo.metadata ? tokenInfo.metadata.toString() : null
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations du token:', error);
      throw new Error(`Échec de la récupération des informations du token: ${error.message}`);
    }
  }

  /**
   * Obtenir le solde d'un compte
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Solde du compte
   */
  async getAccountBalance(accountId) {
    try {
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId));

      const balance = await balanceQuery.execute(this.client);

      return {
        accountId: accountId,
        hbarBalance: balance.hbars.toString(),
        tokens: balance.tokens._map ? Array.from(balance.tokens._map.entries()) : []
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du solde:', error);
      throw new Error(`Échec de la récupération du solde: ${error.message}`);
    }
  }

  /**
   * Vérifier la validité d'un certificat
   * @param {string} tokenId - ID du token
   * @param {string} serialNumber - Numéro de série du NFT
   * @returns {Promise<Object>} Informations de validation
   */
  async validateCertificate(tokenId, serialNumber) {
    try {
      const tokenInfo = await this.getTokenInfo(tokenId);
      
      // Vérifier que le token existe et est valide
      if (!tokenInfo || tokenInfo.totalSupply === '0') {
        return {
          isValid: false,
          reason: 'Token non trouvé ou aucun certificat émis'
        };
      }

      // Vérifier que le numéro de série est valide
      const totalSupply = parseInt(tokenInfo.totalSupply);
      const serial = parseInt(serialNumber);
      
      if (serial < 1 || serial > totalSupply) {
        return {
          isValid: false,
          reason: 'Numéro de série invalide'
        };
      }

      return {
        isValid: true,
        tokenInfo: tokenInfo,
        serialNumber: serialNumber,
        totalSupply: totalSupply
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation du certificat:', error);
      return {
        isValid: false,
        reason: `Erreur de validation: ${error.message}`
      };
    }
  }

  /**
   * Obtenir l'URL HashScan pour un token
   * @param {string} tokenId - ID du token
   * @returns {string} URL HashScan
   */
  getHashScanUrl(tokenId) {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    return `https://hashscan.io/${network}/token/${tokenId}`;
  }

  /**
   * Obtenir l'URL HashScan pour une transaction
   * @param {string} transactionId - ID de la transaction
   * @returns {string} URL HashScan
   */
  getTransactionUrl(transactionId) {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    return `https://hashscan.io/${network}/transaction/${transactionId}`;
  }
}

module.exports = new HederaService();