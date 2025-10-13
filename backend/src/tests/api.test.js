const request = require('supertest');
const app = require('../server');

describe('EduChain Credentials API Tests', () => {
  
  describe('Health Endpoints', () => {
    test('GET /api/health should return 200', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
    });

    test('GET /api/health/live should return 200', async () => {
      const res = await request(app)
        .get('/api/health/live')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.alive).toBe(true);
    });
  });

  describe('Certificate Endpoints', () => {
    test('POST /api/certificates/issue should validate required fields', async () => {
      const invalidCertificate = {
        studentName: '',
        institutionName: 'Test University'
      };

      const res = await request(app)
        .post('/api/certificates/issue')
        .send(invalidCertificate)
        .expect(400);
      
      expect(res.body.error).toBeDefined();
      expect(res.body.details).toBeDefined();
    });

    test('GET /api/certificates/stats should return statistics', async () => {
      const res = await request(app)
        .get('/api/certificates/stats')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCertificates).toBeDefined();
    });
  });

  describe('Verification Endpoints', () => {
    test('POST /api/verify should validate token format', async () => {
      const invalidVerification = {
        tokenId: 'invalid-format',
        serial: 'not-a-number'
      };

      const res = await request(app)
        .post('/api/verify')
        .send(invalidVerification)
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });

    test('GET /api/verify/stats should return verification statistics', async () => {
      const res = await request(app)
        .get('/api/verify/stats')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalVerifications).toBeDefined();
    });
  });

  describe('Institution Endpoints', () => {
    test('POST /api/institutions should validate required fields', async () => {
      const invalidInstitution = {
        name: ''
      };

      const res = await request(app)
        .post('/api/institutions')
        .send(invalidInstitution)
        .expect(400);
      
      expect(res.body.error).toBeDefined();
    });

    test('GET /api/institutions should return institutions list', async () => {
      const res = await request(app)
        .get('/api/institutions')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.institutions).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent should return 404', async () => {
      const res = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      expect(res.body.error).toBeDefined();
    });
  });
});

// Tests d'intégration (nécessitent une configuration Hedera valide)
describe('Integration Tests (requires valid Hedera config)', () => {
  // Ces tests ne s'exécutent que si les variables d'environnement sont configurées
  const hasHederaConfig = process.env.HEDERA_ACCOUNT_ID && 
                          process.env.HEDERA_PRIVATE_KEY &&
                          !process.env.HEDERA_ACCOUNT_ID.includes('xxxxx');

  test.skipIf(!hasHederaConfig)('Should create NFT token', async () => {
    const tokenData = {
      tokenName: 'Test University Certificates',
      tokenSymbol: 'TEST',
      tokenMemo: 'Test certificates for integration testing'
    };

    const res = await request(app)
      .post('/api/certificates/token')
      .send(tokenData)
      .expect(201);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokenId).toMatch(/^0\.0\.\d+$/);
  });

  test.skipIf(!hasHederaConfig)('Should issue certificate', async () => {
    const certificateData = {
      studentName: 'Test Student',
      institutionName: 'Test University',
      certificateType: 'CERTIFICATE',
      fieldOfStudy: 'Computer Science',
      level: 'BACHELOR',
      graduationDate: '2025-01-01'
    };

    const res = await request(app)
      .post('/api/certificates/issue')
      .send(certificateData)
      .expect(201);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data.nft.tokenId).toMatch(/^0\.0\.\d+$/);
    expect(res.body.data.nft.serial).toBeDefined();
  });
});

// Mock des services pour les tests unitaires
jest.mock('../services/hederaService', () => ({
  createCertificateToken: jest.fn().mockResolvedValue('0.0.123456'),
  mintCertificateNFT: jest.fn().mockResolvedValue({
    tokenId: '0.0.123456',
    serial: '1',
    nftId: '0.0.123456/1',
    transactionId: 'mock-tx-id',
    hashscanUrl: 'https://hashscan.io/testnet/token/0.0.123456/1'
  }),
  transferNFT: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'mock-transfer-tx-id'
  }),
  verifyCertificateNFT: jest.fn().mockResolvedValue({
    valid: true,
    hashscanUrl: 'https://hashscan.io/testnet/token/0.0.123456/1'
  }),
  getTokenInfo: jest.fn().mockResolvedValue({
    tokenId: '0.0.123456',
    name: 'Test Token',
    symbol: 'TEST'
  })
}));

jest.mock('../services/ipfsService', () => ({
  uploadCertificateMetadata: jest.fn().mockResolvedValue({
    hash: 'QmMockHash123456789',
    url: 'https://ipfs.infura.io/ipfs/QmMockHash123456789',
    size: 1024
  }),
  uploadImage: jest.fn().mockResolvedValue({
    hash: 'QmMockImageHash123456789',
    url: 'https://ipfs.infura.io/ipfs/QmMockImageHash123456789',
    size: 2048
  }),
  getMetadata: jest.fn().mockResolvedValue({
    name: 'Mock Certificate',
    description: 'Mock certificate for testing'
  })
}));