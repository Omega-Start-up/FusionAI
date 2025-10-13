# 🚀 Guide de Déploiement EduChain Credentials

## 📋 **Vue d'Ensemble**

Ce guide couvre le déploiement complet d'EduChain Credentials en production, incluant la configuration Hedera Mainnet, l'optimisation des performances et la sécurité.

---

## ☁️ **Déploiement Cloud (Railway/Render)**

### 🚂 **Railway (Recommandé)**

1. **Préparation du Projet**
```bash
# Créer railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

2. **Variables d'Environnement**
```bash
NODE_ENV=production
PORT=3000
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.YOUR_MAINNET_ACCOUNT
HEDERA_PRIVATE_KEY=YOUR_MAINNET_PRIVATE_KEY
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_API_KEY=YOUR_INFURA_KEY
IPFS_API_SECRET=YOUR_INFURA_SECRET
JWT_SECRET=your-super-secure-production-secret
API_RATE_LIMIT=1000
FRONTEND_URL=https://your-frontend-domain.com
```

3. **Déploiement**
```bash
# Installation Railway CLI
npm install -g @railway/cli

# Login et déploiement
railway login
railway link
railway up
```

### 🎨 **Render**

1. **Configuration render.yaml**
```yaml
services:
  - type: web
    name: educhain-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: HEDERA_NETWORK
        value: mainnet
```

---

## 🐳 **Déploiement Docker**

### 1. **Dockerfile Optimisé**

```dockerfile
# Multi-stage build pour optimiser la taille
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS production

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S educhain -u 1001

WORKDIR /app

# Copier les dépendances
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=educhain:nodejs . .

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Utilisateur non-root
USER educhain

# Commande de démarrage
CMD ["npm", "start"]
```

### 2. **Docker Compose Production**

```yaml
version: '3.8'

services:
  educhain-backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - HEDERA_NETWORK=mainnet
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - educhain-backend
    restart: unless-stopped
```

### 3. **Configuration Nginx**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream educhain_backend {
        server educhain-backend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Sécurité SSL
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Headers de sécurité
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://educhain_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 🔧 **Configuration Production**

### 1. **Variables d'Environnement Sécurisées**

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Hedera Mainnet
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# IPFS Production
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_API_KEY=YOUR_PRODUCTION_KEY
IPFS_API_SECRET=YOUR_PRODUCTION_SECRET
IPFS_GATEWAY_URL=https://your-custom-gateway.com/ipfs/

# Sécurité
JWT_SECRET=ultra-secure-production-secret-256-bits
API_RATE_LIMIT=1000

# URLs
FRONTEND_URL=https://educhain.your-domain.com

# Monitoring
LOG_LEVEL=warn
LOG_FILE=/var/log/educhain/app.log
```

### 2. **Optimisations Performance**

```javascript
// src/config/production.js
module.exports = {
  // Compression
  compression: {
    level: 6,
    threshold: 1024
  },

  // Cache
  cache: {
    maxAge: 3600000, // 1 heure
    etag: true
  },

  // Rate limiting avancé
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requêtes par IP
    message: 'Trop de requêtes, réessayez plus tard'
  },

  // Clustering
  cluster: {
    enabled: true,
    workers: require('os').cpus().length
  }
};
```

---

## 🔒 **Sécurité Production**

### 1. **Configuration Helmet.js Avancée**

```javascript
// src/middleware/security.js
const helmet = require('helmet');

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://hashscan.io", "https://ipfs.infura.io"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

### 2. **Validation Renforcée**

```javascript
// src/middleware/validation.js
const rateLimit = require('express-rate-limit');

// Rate limiting par endpoint
const createCertificateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 certificats par minute max
  message: 'Limite de création de certificats atteinte'
});

const verificationLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 vérifications par minute
  message: 'Limite de vérifications atteinte'
});
```

---

## 📊 **Monitoring et Logs**

### 1. **Configuration Winston**

```javascript
// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'educhain-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 2. **Health Checks Avancés**

```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

---

## 🌐 **CDN et Optimisations**

### 1. **Configuration Cloudflare**

```javascript
// Cloudflare Workers pour cache IPFS
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Cache IPFS avec Cloudflare
  if (url.pathname.startsWith('/ipfs/')) {
    const ipfsHash = url.pathname.replace('/ipfs/', '');
    const ipfsUrl = `https://ipfs.infura.io/ipfs/${ipfsHash}`;
    
    return fetch(ipfsUrl, {
      cf: {
        cacheTtl: 86400, // 24h cache
        cacheEverything: true
      }
    });
  }
  
  return fetch(request);
}
```

### 2. **Optimisation Images**

```javascript
// src/middleware/imageOptimization.js
const sharp = require('sharp');

const optimizeImage = async (buffer, format = 'webp') => {
  return await sharp(buffer)
    .resize(800, 600, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .toFormat(format, { quality: 85 })
    .toBuffer();
};
```

---

## 🔄 **CI/CD Pipeline**

### 1. **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: educhain-backend
```

### 2. **Scripts de Déploiement**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Déploiement EduChain Backend..."

# Build
npm run build

# Tests
npm test

# Sécurité
npm audit --audit-level moderate

# Déploiement
if [ "$1" = "production" ]; then
  echo "📦 Déploiement en production..."
  railway up --service educhain-backend
else
  echo "🧪 Déploiement en staging..."
  railway up --service educhain-backend-staging
fi

echo "✅ Déploiement terminé!"
```

---

## 📈 **Scaling et Performance**

### 1. **Clustering Node.js**

```javascript
// cluster.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} démarré`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} terminé`);
    cluster.fork();
  });
} else {
  require('./src/server.js');
  console.log(`Worker ${process.pid} démarré`);
}
```

### 2. **Load Balancing**

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  educhain-backend:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - educhain-backend
```

---

## 🔍 **Monitoring Production**

### 1. **Métriques avec Prometheus**

```javascript
// src/middleware/metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const certificatesCreated = new prometheus.Counter({
  name: 'certificates_created_total',
  help: 'Total number of certificates created'
});

module.exports = {
  httpRequestDuration,
  certificatesCreated,
  register: prometheus.register
};
```

### 2. **Alertes**

```yaml
# alerts.yml
groups:
  - name: educhain
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "Taux d'erreur élevé détecté"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 5m
        annotations:
          summary: "Temps de réponse élevé détecté"
```

---

## 🔧 **Maintenance**

### 1. **Backup et Récupération**

```bash
#!/bin/bash
# scripts/backup.sh

# Backup des logs
tar -czf "backup-logs-$(date +%Y%m%d).tar.gz" logs/

# Backup de la configuration
cp .env.production "backup-env-$(date +%Y%m%d).env"

# Upload vers S3 (optionnel)
aws s3 cp backup-logs-*.tar.gz s3://educhain-backups/
```

### 2. **Scripts de Maintenance**

```javascript
// scripts/maintenance.js
const hederaService = require('../src/services/hederaService');

async function checkHederaConnection() {
  try {
    const accountInfo = await hederaService.getAccountInfo(
      process.env.HEDERA_ACCOUNT_ID
    );
    console.log('✅ Connexion Hedera OK');
    console.log(`💰 Balance: ${accountInfo.balance} tinybars`);
  } catch (error) {
    console.error('❌ Erreur Hedera:', error.message);
  }
}

checkHederaConnection();
```

---

## 📋 **Checklist de Déploiement**

### ✅ **Pré-déploiement**
- [ ] Tests passent (unit + integration)
- [ ] Audit de sécurité npm
- [ ] Variables d'environnement configurées
- [ ] Certificats SSL valides
- [ ] Backup de la configuration actuelle

### ✅ **Déploiement**
- [ ] Build réussi
- [ ] Health checks passent
- [ ] Monitoring configuré
- [ ] Logs accessibles
- [ ] Rate limiting configuré

### ✅ **Post-déploiement**
- [ ] Tests de fumée
- [ ] Vérification des métriques
- [ ] Test de charge léger
- [ ] Documentation mise à jour
- [ ] Équipe notifiée

---

**🚀 Votre EduChain Credentials est maintenant prêt pour la production !**