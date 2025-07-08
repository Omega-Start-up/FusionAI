# 🚀 FusionAI - Plateforme de Développement Moderne

**Une plateforme révolutionnaire combinant le meilleur de Cursor, Emergent.sh et Lovable.dev**

[![Angular](https://img.shields.io/badge/Frontend-Angular%2017+-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2018+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Vision du Projet

FusionAI fusionne les meilleures innovations des plateformes de développement les plus avancées :

- **🎨 UI/UX de Cursor** : Interface orientée développeur avec navigation intuitive
- **⚡ Fenêtres dynamiques d'Emergent.sh** : Système multi-fenêtres interactif
- **✨ Design épuré de Lovable.dev** : Esthétique moderne et expérience utilisateur premium

---

## 🏗️ Architecture

```
FusionAI/
├── 📁 frontend/                     # 🔷 Application Angular
│   ├── 📁 src/app/                  # Code source Angular
│   │   ├── 📁 components/           # Composants réutilisables
│   │   ├── 📁 pages/                # Pages de l'application
│   │   ├── 📁 services/             # Services Angular
│   │   └── 📁 models/               # Interfaces TypeScript
│   ├── 📁 src/environments/         # Configuration environnements
│   ├── 📄 package.json              # Dépendances frontend
│   └── 📄 angular.json              # Configuration Angular
│
├── 📁 backend/                      # 🔶 API Node.js
│   ├── 📁 src/                      # Code source Node.js
│   │   ├── 📄 server.js             # Serveur Express principal
│   │   └── 📁 routes/               # Routes API
│   │       ├── 📄 auth.js           # Authentification
│   │       ├── 📄 users.js          # Gestion utilisateurs
│   │       ├── 📄 projects.js       # Gestion projets
│   │       ├── 📄 windows.js        # État des fenêtres
│   │       └── 📄 files.js          # Gestion fichiers
│   ├── 📄 package.json              # Dépendances backend
│   └── 📄 .env.example              # Variables d'environnement
│
├── 📄 README.md                     # Documentation principale (ce fichier)
├── 📄 LICENSE                       # Licence MIT
├── 📄 .gitignore                    # Exclusions Git globales
├── 📄 docker-compose.yml            # Configuration Docker
└── 📄 package.json                  # Scripts globaux (optionnel)
```

---

## 🚀 Installation Rapide

### 📋 Prérequis
- **Node.js** 18+
- **npm** 9+
- **Angular CLI** 17+

### ⚡ Démarrage en 3 étapes

```bash
# 1. Cloner le repository
git clone https://github.com/your-org/fusionai.git
cd FusionAI

# 2. 🔶 Backend - Terminal 1
cd backend
npm install
npm run dev
# ➡️ API disponible sur http://localhost:3000

# 3. 🔷 Frontend - Terminal 2
cd ../frontend
npm install
npm start
# ➡️ Application sur http://localhost:4200
```

### 🌐 URLs de l'Application
- **🔷 Frontend** : http://localhost:4200
- **🔶 Backend API** : http://localhost:3000
- **🏥 Health Check** : http://localhost:3000/health
- **📚 API Documentation** : http://localhost:3000/

---

## 🔷 Frontend (Angular)

### 🛠️ Commandes Disponibles
```bash
cd frontend

npm start                 # Serveur de développement (port 4200)
npm run build             # Build de production  
npm run build:prod        # Build optimisé pour production
npm test                  # Tests unitaires
npm run test:coverage     # Tests avec couverture de code
npm run lint              # Vérification du code
npm run e2e               # Tests end-to-end
```

### 🌟 Fonctionnalités Frontend
- ✅ **Navigation adaptative** (connecté/non connecté)
- ✅ **Système de fenêtres dynamiques** (style Emergent.sh)
- ✅ **Design moderne** avec Angular Material
- ✅ **Pages publiques** (Community, Entreprise, Learn, Shipped)
- ✅ **Workspace authentifié** avec dashboard interactif
- ✅ **Footer structuré** (style Lovable.dev)
- ✅ **Responsive design** mobile-first
- ✅ **Animations fluides** et transitions

### 🎨 Interface Utilisateur

#### 👤 Utilisateur Non Connecté
```
Header: [FusionAI] [Community] [Entreprise] [Learn] [Shipped] [Se connecter ▼]
Pages: Home (Hero + Features) + Pages publiques + Footer détaillé
```

#### 🔐 Utilisateur Connecté  
```
Header: [🏠 Home] [</> Code] [🐙 GitHub] [🗄️ DB] [✉️ Invite] [⬆️ Upgrade] [🚀 Publish] [👤 Menu]
Workspace: Dashboard + Fenêtres dynamiques + Taskbar
```

---

## 🔶 Backend (Node.js)

### 🛠️ Commandes Disponibles
```bash
cd backend

npm start                 # Serveur production (port 3000)
npm run dev               # Serveur développement avec nodemon
npm test                  # Tests API avec Jest
npm run test:coverage     # Tests avec couverture
npm run lint              # Vérification du code ESLint
npm run lint:fix          # Correction automatique
```

### 🔗 API Endpoints

#### 🔐 Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/verify` - Vérification token
- `POST /api/auth/refresh` - Renouvellement token
- `POST /api/auth/logout` - Déconnexion

#### 👤 Gestion Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Mettre à jour profil
- `GET /api/users/stats` - Statistiques utilisateur

#### 📂 Gestion Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/:id` - Détails d'un projet
- `PUT /api/projects/:id` - Mettre à jour projet
- `DELETE /api/projects/:id` - Supprimer projet

#### 🪟 Gestion Fenêtres
- `GET /api/windows` - État des fenêtres
- `POST /api/windows/state` - Sauvegarder état fenêtre
- `DELETE /api/windows/:id` - Supprimer fenêtre
- `DELETE /api/windows` - Effacer toutes les fenêtres

#### 📄 Gestion Fichiers
- `GET /api/files` - Liste des fichiers
- `POST /api/files/upload` - Upload fichiers
- `GET /api/files/:id` - Détails fichier
- `GET /api/files/:id/download` - Télécharger fichier
- `DELETE /api/files/:id` - Supprimer fichier

---

## 🔧 Configuration

### 🔷 Frontend Configuration
```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'FusionAI',
  version: '1.0.0'
};
```

### 🔶 Backend Configuration
```bash
# backend/.env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
JWT_SECRET=your-super-secure-secret-here
JWT_EXPIRES_IN=24h
```

---

## 🚢 Déploiement

### 🔷 Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build:prod

# Vercel
npx vercel --prod

# Netlify  
npx netlify deploy --prod --dir=dist/fusionai-frontend
```

### 🔶 Backend (Railway/Render/Heroku)
```bash
cd backend
npm run deploy

# Ou avec Docker
docker build -t fusionai-backend .
docker run -p 3000:3000 fusionai-backend
```

### 🐳 Docker Compose (Full Stack)
```bash
# À la racine du projet
docker-compose up -d

# Accès
# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

---

## 📚 Exemples d'Utilisation

### 🔐 Authentification
```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@fusionai.dev","password":"password"}'

# Utilisation du token
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 📂 Gestion de Projets
```bash
# Créer un projet
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mon Projet","description":"Description","technologies":["Angular","Node.js"]}'
```

### 📄 Upload de Fichiers
```bash
# Upload fichier
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@document.pdf" \
  -F "projectId=1"
```

---

## 🧪 Tests

### 🔷 Tests Frontend
```bash
cd frontend
npm test                  # Tests unitaires
npm run test:coverage     # Avec couverture
npm run e2e               # Tests end-to-end
```

### 🔶 Tests Backend
```bash
cd backend
npm test                  # Tests API
npm run test:coverage     # Avec couverture
npm run test:watch        # Mode watch
```

---

## 🌟 Fonctionnalités Avancées

### 🪟 Système de Fenêtres Dynamiques
- **Fenêtres flottantes** redimensionnables
- **Multi-projets** avec onglets
- **États persistants** (position, taille)
- **Taskbar** pour fenêtres minimisées
- **Types spécialisés** (Code, GitHub, DB, etc.)

### 🔐 Sécurité Renforcée
- **JWT Authentication** avec refresh tokens
- **Rate limiting** (100 req/15min par IP)
- **Validation** stricte des données
- **CORS** configuré finement
- **Helmet.js** pour sécuriser les headers

### 📱 Responsive Design
- **Mobile-first** approach
- **Breakpoints** optimisés
- **Touch-friendly** interfaces
- **Progressive Web App** ready

---

## 🤝 Contribution

### 🔷 Contribuer au Frontend
```bash
cd frontend
git checkout -b feature/frontend-feature
# Faire vos modifications
npm run lint
npm test
git commit -m "feat(frontend): add new component"
```

### 🔶 Contribuer au Backend
```bash
cd backend
git checkout -b feature/backend-feature
# Faire vos modifications
npm run lint
npm test
git commit -m "feat(backend): add new endpoint"
```

### 📝 Standards de Code
- **TypeScript** strict mode
- **ESLint** + **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests unitaires** obligatoires
- **Documentation** complète

---

## 🔮 Roadmap

### Phase 1 (Actuelle) ✅
- ✅ Architecture frontend/backend séparée
- ✅ Authentification JWT
- ✅ Système de fenêtres de base
- ✅ CRUD projets et fichiers

### Phase 2 (À venir)
- 🔄 Collaboration temps réel (WebSockets)
- 🔄 Intégration GitHub avancée
- 🔄 Éditeur de code intégré
- 🔄 Base de données PostgreSQL

### Phase 3 (Futur)
- 🔮 IA intégrée pour assistance code
- 🔮 Déploiement automatique
- 🔮 Analytics avancés
- 🔮 Marketplace de plugins

---

## 📊 Performance & Métriques

### 🔷 Frontend
- **Build size** : < 1MB gzippé
- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s
- **Lighthouse Score** : 95+

### 🔶 Backend
- **Response time** : < 100ms moyenne
- **Throughput** : 1000+ req/s
- **Memory usage** : < 512MB
- **CPU usage** : < 50%

---

## 💡 Comptes de Test

### Utilisateur Demo
- **Email** : `demo@fusionai.dev`
- **Mot de passe** : `password`
- **Plan** : Pro

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Login demo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@fusionai.dev","password":"password"}'
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

Merci aux équipes de **Cursor**, **Emergent.sh** et **Lovable.dev** pour leur inspiration révolutionnaire.

---

## 📞 Support & Contact

- 📧 **Email** : support@fusionai.dev
- 💬 **Discord** : [FusionAI Community](https://discord.gg/fusionai)
- 🐛 **Issues** : [GitHub Issues](https://github.com/your-org/fusionai/issues)
- 📚 **Documentation** : [docs.fusionai.dev](https://docs.fusionai.dev)
- 🌐 **Website** : [fusionai.dev](https://fusionai.dev)

---

**🚀 Prêt à révolutionner votre expérience de développement avec FusionAI !**

*Built with ❤️ by developers, for developers.*