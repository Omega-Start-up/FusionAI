const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenId,
  CustomRoyaltyFee,
  Hbar
} = require('@hashgraph/sdk');

class HederaService {
  constructor() {
    this.client = this.initializeClient();
    this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    this.privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  }

  initializeClient() {
    const client = Client.forTestnet(); // ou Client.forMainnet() pour la production
    
    if (process.env.HEDERA_NETWORK === 'mainnet') {
      return Client.forMainnet();
    }
    
    return Client.forTestnet();
  }

  async setOperator(accountId, privateKey) {
    this.client.setOperator(accountId, privateKey);
  }

  async getAccountBalance() {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.accountId)
        .execute(this.client);
      
      return {
        hbars: balance.hbars.toString(),
        tokens: balance.tokens.toString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      throw new Error('Impossible de récupérer le solde du compte');
    }
  }

  async createNFTToken(tokenName, tokenSymbol, metadata) {
    try {
      console.log('🪙 Création du token NFT...');
      
      // Créer le token NFT
      const tokenCreateTransaction = await new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType('NON_FUNGIBLE_UNIQUE')
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(this.accountId)
        .setAdminKey(this.privateKey.publicKey)
        .setSupplyKey(this.privateKey)
        .setMetadata(metadata)
        .setMaxSupply(1000000) // Limite maximale
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTransaction.sign(this.privateKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);
      
      const tokenId = tokenCreateReceipt.tokenId;
      
      console.log(`✅ Token NFT créé avec succès: ${tokenId}`);
      
      return {
        tokenId: tokenId.toString(),
        transactionHash: tokenCreateReceipt.transactionId.toString(),
        status: 'SUCCESS'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du token NFT:', error);
      throw new Error(`Erreur création token NFT: ${error.message}`);
    }
  }

  async mintNFT(tokenId, metadata) {
    try {
      console.log(`🪙 Mint du NFT pour le token ${tokenId}...`);
      
      const tokenMintTransaction = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setMetadata([metadata])
        .freezeWith(this.client);

      const tokenMintSign = await tokenMintTransaction.sign(this.privateKey);
      const tokenMintSubmit = await tokenMintSign.execute(this.client);
      const tokenMintReceipt = await tokenMintSubmit.getReceipt(this.client);
      
      const serialNumber = tokenMintReceipt.serials[0];
      
      console.log(`✅ NFT minté avec succès. Serial: ${serialNumber}`);
      
      return {
        serialNumber: serialNumber.toString(),
        transactionHash: tokenMintReceipt.transactionId.toString(),
        status: 'SUCCESS'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du mint du NFT:', error);
      throw new Error(`Erreur mint NFT: ${error.message}`);
    }
  }

  async transferNFT(tokenId, serialNumber, fromAccount, toAccount, privateKey) {
    try {
      console.log(`🔄 Transfert du NFT ${tokenId} serial ${serialNumber}...`);
      
      // Associer le token au compte de destination si nécessaire
      const associateTransaction = await new TokenAssociateTransaction()
        .setAccountId(toAccount)
        .setTokenIds([TokenId.fromString(tokenId)])
        .freezeWith(this.client);

      const associateSign = await associateTransaction.sign(privateKey);
      await associateSign.execute(this.client);
      
      // Effectuer le transfert
      const transferTransaction = await new TransferTransaction()
        .addNftTransfer(
          TokenId.fromString(tokenId),
          serialNumber,
          fromAccount,
          toAccount
        )
        .freezeWith(this.client);

      const transferSign = await transferTransaction.sign(privateKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferReceipt = await transferSubmit.getReceipt(this.client);
      
      console.log(`✅ NFT transféré avec succès`);
      
      return {
        transactionHash: transferReceipt.transactionId.toString(),
        status: 'SUCCESS'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du transfert du NFT:', error);
      throw new Error(`Erreur transfert NFT: ${error.message}`);
    }
  }

  async getTokenInfo(tokenId) {
    try {
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(TokenId.fromString(tokenId))
        .execute(this.client);
      
      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply.toString(),
        decimals: tokenInfo.decimals,
        treasury: tokenInfo.treasuryAccountId.toString(),
        adminKey: tokenInfo.adminKey ? tokenInfo.adminKey.toString() : null,
        supplyKey: tokenInfo.supplyKey ? tokenInfo.supplyKey.toString() : null
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos du token:', error);
      throw new Error(`Erreur récupération token: ${error.message}`);
    }
  }

  async getNFTInfo(tokenId, serialNumber) {
    try {
      const nftInfo = await new TokenNftInfoQuery()
        .setTokenId(TokenId.fromString(tokenId))
        .setNftId(serialNumber)
        .execute(this.client);
      
      return {
        tokenId: nftInfo.tokenId.toString(),
        serialNumber: nftInfo.nftId.toString(),
        accountId: nftInfo.accountId.toString(),
        metadata: nftInfo.metadata.toString(),
        creationTime: nftInfo.creationTime
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos du NFT:', error);
      throw new Error(`Erreur récupération NFT: ${error.message}`);
    }
  }

  async validateTransaction(transactionHash) {
    try {
      const transactionId = TransactionId.fromString(transactionHash);
      const transactionRecord = await transactionId.getRecord(this.client);
      
      return {
        isValid: transactionRecord.receipt.status === 'SUCCESS',
        status: transactionRecord.receipt.status,
        transactionHash: transactionHash,
        timestamp: transactionRecord.consensusTimestamp
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation de la transaction:', error);
      return {
        isValid: false,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // Méthode utilitaire pour créer un certificat complet
  async createCertificateNFT(certificateData, ipfsUrl) {
    try {
      console.log('🎓 Création du certificat NFT complet...');
      
      // 1. Créer le token NFT s'il n'existe pas
      let tokenId = process.env.EDU_CERT_TOKEN_ID;
      
      if (!tokenId) {
        const tokenResult = await this.createNFTToken(
          'EduChain Certificate',
          'EDUCERT',
          Buffer.from('EduChain Academic Certificate')
        );
        tokenId = tokenResult.tokenId;
        console.log(`📝 Nouveau token créé: ${tokenId}`);
      }
      
      // 2. Mint le NFT avec les métadonnées IPFS
      const mintResult = await this.mintNFT(tokenId, Buffer.from(ipfsUrl));
      
      return {
        tokenId,
        serialNumber: mintResult.serialNumber,
        transactionHash: mintResult.transactionHash,
        status: 'SUCCESS'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du certificat NFT:', error);
      throw new Error(`Erreur création certificat: ${error.message}`);
    }
  }
}

module.exports = new HederaService();