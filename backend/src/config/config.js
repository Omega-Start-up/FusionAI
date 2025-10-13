const config = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
  },

  // Configuration Hedera
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
    publicKey: process.env.HEDERA_PUBLIC_KEY,
    // Frais de transaction par défaut (en tinybars)
    defaultTransactionFee: 100000000, // 1 HBAR
    // Configuration des tokens NFT
    nft: {
      name: 'EduChain Certificate',
      symbol: 'EDU',
      decimals: 0,
      initialSupply: 0,
      maxSupply: 1000000
    }
  },

  // Configuration IPFS
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    apiKey: process.env.IPFS_API_KEY,
    apiSecret: process.env.IPFS_API_SECRET,
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://ipfs.infura.io/ipfs/',
    timeout: 30000 // 30 secondes
  },

  // Configuration de sécurité
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 100,
    // Tailles limites pour les uploads
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Configuration HashConnect
  hashConnect: {
    appName: process.env.HASHCONNECT_APP_NAME || 'EduChain Credentials',
    appDescription: process.env.HASHCONNECT_APP_DESCRIPTION || 'Certification académique décentralisée',
    iconUrl: process.env.HASHCONNECT_ICON_URL || 'https://yourdomain.com/icon.png'
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // Métadonnées par défaut pour les certificats
  certificate: {
    defaultMetadata: {
      type: 'EduChain Certificate',
      version: '1.0',
      standard: 'HIP-412', // Hedera Token Service standard
      properties: {
        category: 'Academic Certificate',
        blockchain: 'Hedera Hashgraph',
        verifiable: true
      }
    },
    // Types de certificats supportés
    types: {
      DIPLOMA: 'Diplôme',
      CERTIFICATE: 'Certificat',
      BADGE: 'Badge',
      ATTESTATION: 'Attestation',
      TRANSCRIPT: 'Relevé de notes'
    },
    // Niveaux d'éducation
    levels: {
      HIGH_SCHOOL: 'Lycée',
      BACHELOR: 'Licence',
      MASTER: 'Master',
      PHD: 'Doctorat',
      PROFESSIONAL: 'Professionnel',
      CONTINUING_EDUCATION: 'Formation continue'
    }
  },

  // URLs et endpoints externes
  external: {
    hashscanBaseUrl: process.env.HEDERA_NETWORK === 'mainnet' 
      ? 'https://hashscan.io' 
      : 'https://hashscan.io/testnet',
    mirrorNodeUrl: process.env.HEDERA_NETWORK === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com'
  }
};

// Validation de la configuration
const validateConfig = () => {
  const requiredEnvVars = [
    'HEDERA_ACCOUNT_ID',
    'HEDERA_PRIVATE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('📋 Copiez .env.example vers .env et remplissez les valeurs');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  console.log('✅ Configuration validée');
  console.log(`🌐 Réseau Hedera: ${config.hedera.network}`);
  console.log(`📡 Compte Hedera: ${config.hedera.accountId}`);
  console.log(`🔗 IPFS Gateway: ${config.ipfs.gatewayUrl}`);
};

// Valider la configuration au démarrage
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;