# 🎓 EduChain Credentials - Backend API

**API Node.js pour la certification académique décentralisée sur Hedera**

## 🚀 **Démarrage Rapide**

### 📋 **Prérequis**
- Node.js 18+
- npm 9+
- Compte Hedera Testnet
- Clés API IPFS (Infura)

### ⚡ **Installation**

```bash
# 1. Installation des dépendances
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos clés

# 3. Démarrage
npm run dev
```

### 🌐 **URLs**
- **API** : http://localhost:3000
- **Health** : http://localhost:3000/api/health
- **Docs** : http://localhost:3000

---

## 📚 **API Endpoints**

### 🎓 **Certificats**
- `POST /api/certificates/issue` - Émettre un certificat
- `GET /api/certificates/:tokenId/:serial` - Récupérer un certificat
- `POST /api/certificates/transfer` - Transférer un certificat
- `GET /api/certificates` - Lister les certificats

### 🔍 **Vérification**
- `POST /api/verify` - Vérifier un certificat
- `GET /api/verify/:tokenId/:serial` - Vérification directe
- `POST /api/verify/batch` - Vérification en lot

### 🏛️ **Institutions**
- `POST /api/institutions` - Enregistrer une institution
- `GET /api/institutions/:id` - Récupérer une institution
- `GET /api/institutions` - Lister les institutions

### 🏥 **Santé**
- `GET /api/health` - État de santé basique
- `GET /api/health/detailed` - Vérification approfondie
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

---

## 🛠️ **Configuration**

### 📄 **Variables d'Environnement**

```bash
# Serveur
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_PUBLIC_KEY=302a300506032b6570032100...

# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_API_KEY=your_api_key
IPFS_API_SECRET=your_api_secret
IPFS_GATEWAY_URL=https://ipfs.infura.io/ipfs/

# Sécurité
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100
```

---

## 🧪 **Tests & Développement**

```bash
# Développement avec rechargement automatique
npm run dev

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Production
npm start
```

---

## 📁 **Structure du Projet**

```
src/
├── controllers/     # Logique métier
├── routes/          # Routes API
├── services/        # Services (Hedera, IPFS)
├── models/          # Modèles et validation
├── middleware/      # Middleware Express
├── config/          # Configuration
└── server.js        # Point d'entrée
```

---

## 🔧 **Services Principaux**

### 🌐 **HederaService**
- Création de tokens NFT
- Mint de certificats
- Transferts de NFT
- Vérification sur blockchain

### 📦 **IPFSService**
- Upload de métadonnées
- Stockage d'images
- Récupération de fichiers
- Validation des données

---

## 🚀 **Déploiement**

### ☁️ **Production**
```bash
NODE_ENV=production npm start
```

### 🐳 **Docker**
```bash
docker build -t educhain-backend .
docker run -p 3000:3000 educhain-backend
```

---

## 📊 **Monitoring**

- **Health Checks** : `/api/health/*`
- **Logs** : Console + fichiers
- **Métriques** : Mémoire, CPU, uptime
- **Erreurs** : Middleware centralisé

---

## 🔒 **Sécurité**

- Rate limiting (100 req/15min)
- Validation Joi stricte
- CORS configuré
- Helmet.js pour headers
- Gestion d'erreurs sécurisée

---

## 🤝 **Contribution**

1. Fork le projet
2. Créer une branche feature
3. Développer et tester
4. Créer une Pull Request

---

**Made with ❤️ for Hashgraph Hackathon 2025**