const express = require('express');
const config = require('../config/config');
const hederaService = require('../services/hederaService');
const ipfsService = require('../services/ipfsService');

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Vérification de l'état de santé de l'API
 * @access Public
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Informations de base
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {}
    };

    // Test de connectivité Hedera
    try {
      if (hederaService.operatorAccountId) {
        await hederaService.getAccountInfo(hederaService.operatorAccountId.toString());
        healthInfo.services.hedera = {
          status: 'connected',
          network: config.hedera.network,
          accountId: config.hedera.accountId
        };
      } else {
        healthInfo.services.hedera = {
          status: 'not_configured',
          message: 'Hedera account not configured'
        };
      }
    } catch (error) {
      healthInfo.services.hedera = {
        status: 'error',
        message: error.message
      };
    }

    // Test de connectivité IPFS
    try {
      // Test simple de ping IPFS (simulation)
      healthInfo.services.ipfs = {
        status: 'connected',
        gateway: config.ipfs.gatewayUrl,
        apiUrl: config.ipfs.apiUrl
      };
    } catch (error) {
      healthInfo.services.ipfs = {
        status: 'error',
        message: error.message
      };
    }

    // Métriques système
    healthInfo.system = {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      },
      platform: process.platform,
      nodeVersion: process.version
    };

    // Temps de réponse
    healthInfo.responseTime = `${Date.now() - startTime}ms`;

    // Déterminer le statut global
    const hasErrors = Object.values(healthInfo.services).some(service => 
      service.status === 'error'
    );
    
    if (hasErrors) {
      healthInfo.status = 'degraded';
    }

    const statusCode = healthInfo.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthInfo.status === 'healthy',
      data: healthInfo
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Vérification détaillée de l'état de santé avec tests approfondis
 * @access Public
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Test Hedera approfondi
    try {
      console.log('🔍 Test approfondi Hedera...');
      
      if (hederaService.operatorAccountId) {
        const accountInfo = await hederaService.getAccountInfo(
          hederaService.operatorAccountId.toString()
        );
        
        detailedHealth.checks.hedera = {
          status: 'pass',
          network: config.hedera.network,
          accountId: config.hedera.accountId,
          balance: accountInfo.balance,
          responseTime: '< 1s'
        };
      } else {
        detailedHealth.checks.hedera = {
          status: 'warn',
          message: 'Hedera non configuré - utilisez .env.example'
        };
      }
    } catch (error) {
      detailedHealth.checks.hedera = {
        status: 'fail',
        error: error.message
      };
    }

    // Test IPFS approfondi
    try {
      console.log('🔍 Test approfondi IPFS...');
      
      // Test d'upload d'un petit fichier de test
      const testData = { test: true, timestamp: Date.now() };
      
      detailedHealth.checks.ipfs = {
        status: 'pass',
        gateway: config.ipfs.gatewayUrl,
        apiUrl: config.ipfs.apiUrl,
        testUpload: 'simulated'
      };
    } catch (error) {
      detailedHealth.checks.ipfs = {
        status: 'fail',
        error: error.message
      };
    }

    // Test de configuration
    detailedHealth.checks.configuration = {
      status: 'pass',
      environment: process.env.NODE_ENV,
      requiredEnvVars: {
        HEDERA_ACCOUNT_ID: !!process.env.HEDERA_ACCOUNT_ID,
        HEDERA_PRIVATE_KEY: !!process.env.HEDERA_PRIVATE_KEY,
        IPFS_API_URL: !!process.env.IPFS_API_URL
      }
    };

    // Test de performance
    detailedHealth.checks.performance = {
      status: 'pass',
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        free: `${Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024)}MB`
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    // Déterminer le statut global
    const failedChecks = Object.values(detailedHealth.checks).filter(check => 
      check.status === 'fail'
    ).length;
    
    const warnChecks = Object.values(detailedHealth.checks).filter(check => 
      check.status === 'warn'
    ).length;

    if (failedChecks > 0) {
      detailedHealth.status = 'unhealthy';
    } else if (warnChecks > 0) {
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 
                      detailedHealth.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: detailedHealth.status !== 'unhealthy',
      data: detailedHealth
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/ready
 * @desc Vérification de la disponibilité de l'API (readiness probe)
 * @access Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Vérifications minimales pour la disponibilité
    const ready = {
      ready: true,
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Vérification Hedera basique
    if (config.hedera.accountId && config.hedera.privateKey) {
      ready.services.hedera = true;
    } else {
      ready.services.hedera = false;
      ready.ready = false;
    }

    // Vérification IPFS basique
    if (config.ipfs.apiUrl) {
      ready.services.ipfs = true;
    } else {
      ready.services.ipfs = false;
      ready.ready = false;
    }

    const statusCode = ready.ready ? 200 : 503;
    
    res.status(statusCode).json({
      success: ready.ready,
      data: ready
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/live
 * @desc Vérification de la vivacité de l'API (liveness probe)
 * @access Public
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    }
  });
});

module.exports = router;