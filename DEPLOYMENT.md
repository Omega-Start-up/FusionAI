# 🚀 Guide de Déploiement - EduChain Credentials

Ce guide vous accompagne dans le déploiement de la solution **EduChain Credentials** sur différents environnements.

## 📋 Prérequis

### Outils requis
- **Node.js** 18+ et **npm** 9+
- **Docker** et **Docker Compose**
- **Git**
- **MongoDB** (local ou cloud)
- **Compte Hedera** avec clés API
- **Compte IPFS** (Infura recommandé)

### Comptes externes
- [Hedera Portal](https://portal.hedera.com/) - Pour les clés API
- [Infura IPFS](https://infura.io/) - Pour le stockage décentralisé
- [Vercel/Netlify](https://vercel.com/) - Pour le frontend (optionnel)
- [Railway/Render](https://railway.app/) - Pour le backend (optionnel)

---

## 🔧 Configuration

### 1. Cloner le repository

```bash
git clone https://github.com/your-org/edu-chain-credentials.git
cd edu-chain-credentials
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
nano .env
```

**Variables obligatoires :**

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=your-private-key-here
HEDERA_PUBLIC_KEY=your-public-key-here

# IPFS Configuration
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
IPFS_PROJECT_ID=your-infura-project-id
IPFS_PROJECT_SECRET=your-infura-project-secret

# Database
MONGODB_URI=mongodb://localhost:27017/edu-chain-credentials

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

---

## 🐳 Déploiement avec Docker (Recommandé)

### Démarrage rapide

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Services inclus
- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **MongoDB** : localhost:27017
- **Redis** : localhost:6379
- **IPFS** : localhost:5001

### Commandes utiles

```bash
# Redémarrer un service
docker-compose restart backend

# Mettre à jour les images
docker-compose pull
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Supprimer les volumes (ATTENTION: supprime les données)
docker-compose down -v
```

---

## 🖥️ Déploiement Manuel

### Backend (Node.js)

```bash
cd backend

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

### Frontend (Angular)

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer en développement
npm start

# Build pour production
npm run build:prod
```

---

## ☁️ Déploiement Cloud

### Frontend sur Vercel

```bash
cd frontend

# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configuration des variables d'environnement
vercel env add API_URL
vercel env add HEDERA_NETWORK
```

### Backend sur Railway

```bash
cd backend

# Installer Railway CLI
npm i -g @railway/cli

# Déployer
railway login
railway init
railway up

# Configuration des variables d'environnement
railway variables set MONGODB_URI=your-mongodb-uri
railway variables set HEDERA_ACCOUNT_ID=your-account-id
```

### Base de données MongoDB Atlas

1. Créer un cluster sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Configurer l'accès réseau (0.0.0.0/0 pour le développement)
3. Créer un utilisateur avec les permissions appropriées
4. Récupérer l'URI de connexion

---

## 🔐 Configuration de la Sécurité

### HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get install certbot

# Générer les certificats
sudo certbot certonly --standalone -d yourdomain.com

# Configurer le renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuration Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

---

## 📊 Monitoring et Logs

### Configuration des logs

```bash
# Logs Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs système
journalctl -u edu-chain-backend -f
```

### Monitoring avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer l'application
pm2 start backend/src/server.js --name "edu-chain-backend"

# Monitoring
pm2 monit
pm2 logs edu-chain-backend
```

---

## 🔄 Mise à jour et Maintenance

### Mise à jour du code

```bash
# Récupérer les dernières modifications
git pull origin main

# Rebuild et redémarrage
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Sauvegarde de la base de données

```bash
# Sauvegarde MongoDB
docker exec edu-chain-mongodb mongodump --out /backup

# Restauration
docker exec edu-chain-mongodb mongorestore /backup
```

---

## 🧪 Tests de Déploiement

### Tests de santé

```bash
# Test de l'API
curl http://localhost:3000/health

# Test du frontend
curl http://localhost:4200

# Test de la base de données
docker exec edu-chain-mongodb mongo --eval "db.stats()"
```

### Tests de performance

```bash
# Test de charge avec Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test de charge avec Artillery
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/health
```

---

## 🚨 Dépannage

### Problèmes courants

**1. Erreur de connexion MongoDB**
```bash
# Vérifier le statut du conteneur
docker-compose ps mongodb

# Vérifier les logs
docker-compose logs mongodb
```

**2. Erreur de clés Hedera**
```bash
# Vérifier les variables d'environnement
docker-compose exec backend env | grep HEDERA

# Tester la connexion Hedera
docker-compose exec backend node -e "console.log('Test Hedera')"
```

**3. Erreur IPFS**
```bash
# Vérifier la connectivité IPFS
curl -X POST "https://ipfs.infura.io:5001/api/v0/version"
```

### Logs utiles

```bash
# Logs complets
docker-compose logs --tail=100

# Logs en temps réel
docker-compose logs -f --tail=50

# Logs d'un service spécifique
docker-compose logs backend
```

---

## 📞 Support

En cas de problème :

1. **Vérifier les logs** : `docker-compose logs`
2. **Consulter la documentation** : [README.md](README.md)
3. **Créer une issue** : [GitHub Issues](https://github.com/your-org/edu-chain-credentials/issues)
4. **Contacter l'équipe** : support@edu-chain.dev

---

**🎉 Félicitations ! Votre déploiement EduChain Credentials est maintenant opérationnel !**