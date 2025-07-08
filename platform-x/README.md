# 🚀 Platform X

**Une plateforme de développement moderne inspirée du meilleur de Cursor, Emergent.sh et Lovable.dev**

[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Vision du Projet

Platform X combine les meilleures fonctionnalités de trois plateformes révolutionnaires :

- **🎨 UI/UX de Cursor** : Interface orientée développeur avec navigation intuitive
- **⚡ Fenêtres dynamiques d'Emergent.sh** : Système multi-fenêtres interactif
- **✨ Design épuré de Lovable.dev** : Esthétique moderne et expérience utilisateur premium

## 📋 Table des Matières

- [🌟 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#-architecture)
- [🚀 Installation](#-installation)
- [💻 Développement](#-développement)
- [📱 Interface Utilisateur](#-interface-utilisateur)
- [🔧 Configuration](#-configuration)
- [🚢 Déploiement](#-déploiement)
- [📚 Documentation API](#-documentation-api)
- [🤝 Contribution](#-contribution)

## 🌟 Fonctionnalités

### 🔐 Authentification Adaptive
- **Connecté** : Navigation workspace avec outils développeur
- **Non connecté** : Pages publiques (Community, Entreprise, Learn, Shipped)
- **Système de tokens JWT** sécurisé
- **Gestion des sessions** persistantes

### 🪟 Système de Fenêtres Dynamiques
- **Fenêtres flottantes** comme Emergent.sh
- **Multi-projets** avec onglets
- **Redimensionnement et déplacement** intuitifs
- **Taskbar** pour fenêtres minimisées
- **États** : Normal, Minimisé, Maximisé

### 🛠️ Outils Intégrés
- **📝 Éditeur de code** avancé
- **🐙 GitHub Browser** intégré
- **🗄️ Database Viewer** en temps réel
- **📨 Système d'invitation** d'équipe
- **⚙️ Paramètres** personnalisables
- **🚀 Publication** de projets

### 🎨 Design System
- **Angular Material** avec thème personnalisé
- **Animations fluides** et transitions
- **Responsive design** mobile-first
- **Mode sombre/clair** (à venir)

## 🏗️ Architecture

```
platform-x/
├── 📁 src/                          # Frontend Angular
│   ├── 📁 app/
│   │   ├── 📁 components/            # Composants réutilisables
│   │   │   ├── 📁 header/           # Navigation principale
│   │   │   ├── 📁 footer/           # Footer style Lovable
│   │   │   ├── 📁 window-container/ # Gestionnaire de fenêtres
│   │   │   └── 📁 windows/          # Fenêtres spécialisées
│   │   ├── 📁 pages/                # Pages de l'application
│   │   ├── 📁 services/             # Services Angular
│   │   ├── 📁 models/               # Interfaces TypeScript
│   │   └── 📁 guards/               # Guards de routage
│   ├── 📁 assets/                   # Ressources statiques
│   └── 📁 environments/             # Configuration d'environnement
├── 📁 backend/                      # Backend Node.js
│   ├── 📁 routes/                   # Routes API Express
│   ├── 📁 middleware/               # Middleware personnalisé
│   ├── 📁 models/                   # Modèles de données
│   └── 📄 server.js                 # Serveur principal
└── 📄 README.md                     # Documentation
```

### 🔄 Flow de Navigation

#### Utilisateur Non Connecté
```
Header: [Logo] [Community] [Entreprise] [Learn] [Shipped] [Se connecter ▼]
                                                           ├── Connexion
                                                           └── Créer un compte
```

#### Utilisateur Connecté
```
Header: [🏠 Home] [</> Code] [🐙 GitHub] [🗄️ DB] [✉️ Invite] [⬆️ Upgrade] [🚀 Publish] [👤 Menu]
                                                                                        ├── Profil
                                                                                        ├── Paramètres
                                                                                        └── Déconnexion
```

## 🚀 Installation

### 📋 Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Angular CLI** 17+

### 🔧 Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/your-org/platform-x.git
cd platform-x

# 2. Installer les dépendances frontend
npm install

# 3. Installer les dépendances backend
cd backend
npm install
cd ..

# 4. Configuration
cp .env.example .env
# Éditer le fichier .env avec vos configurations

# 5. Démarrer en mode développement
npm run dev
```

### 🌐 URLs de Développement
- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Health Check** : http://localhost:3000/health

## 💻 Développement

### 🛠️ Commandes Disponibles

```bash
# Frontend (Angular)
npm start              # Démarrer le serveur de développement
npm run build          # Build de production
npm run test           # Tests unitaires
npm run lint           # Linting du code

# Backend (Node.js)
npm run serve:backend  # Démarrer l'API backend
cd backend && npm run dev  # Mode développement avec nodemon

# Full Stack
npm run dev           # Démarrer frontend + backend en parallèle
```

### 🧪 Tests et Qualité

```bash
# Tests Frontend
ng test                # Tests unitaires Angular
ng e2e                 # Tests end-to-end

# Tests Backend
cd backend
npm test              # Tests API avec Jest
npm run lint          # ESLint pour Node.js
```

## 📱 Interface Utilisateur

### 🎨 Système de Design

#### Couleurs Principales
```scss
$primary: #2196f3;     // Bleu moderne
$accent: #9c27b0;      // Violet créatif
$success: #10b981;     // Vert succès
$warning: #f59e0b;     // Orange attention
$error: #ef4444;       // Rouge erreur
```

#### Composants Clés

**🏠 Header Adaptatif**
- Navigation conditionnelle selon l'authentification
- Icônes fonctionnelles style Cursor
- Menu utilisateur avec dropdown

**🪟 Fenêtres Dynamiques**
- Système de fenêtres flottantes
- Gestion des états (minimisé, maximisé, fermé)
- Taskbar pour navigation entre fenêtres

**🦶 Footer Structuré**
- Links organisés par catégories
- Réseaux sociaux
- Informations légales

### 📱 Responsive Design

```scss
// Mobile First
@media (max-width: 480px)  { /* Mobile */ }
@media (max-width: 768px)  { /* Tablet */ }
@media (max-width: 1024px) { /* Desktop Small */ }
@media (min-width: 1025px) { /* Desktop Large */ }
```

## 🔧 Configuration

### 🌍 Variables d'Environnement

#### Frontend (`src/environments/`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Platform X',
  version: '1.0.0'
};
```

#### Backend (`.env`)
```bash
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Security
JWT_SECRET=your-super-secure-secret-key-here

# Database (when implemented)
DATABASE_URL=postgresql://user:password@localhost:5432/platform_x

# External Services
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 🔐 Sécurité

- **JWT Authentication** avec expiration
- **CORS** configuré pour le frontend
- **Rate Limiting** (100 req/15min par IP)
- **Helmet.js** pour sécuriser les headers
- **Validation** des entrées avec express-validator

## 🚢 Déploiement

### ☁️ Frontend (Vercel/Netlify)

```bash
# Build de production
npm run build

# Déployer sur Vercel
vercel --prod

# Ou sur Netlify
netlify deploy --prod --dir=dist/platform-x
```

### 🖥️ Backend (Railway/Render)

```bash
# Build Docker (optionnel)
docker build -t platform-x-backend ./backend

# Déployer sur Railway
railway up

# Ou variables d'environnement pour Render
# Configurer les env vars dans l'interface
```

### 🐳 Docker (Production)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4200
CMD ["npm", "start"]
```

### 🚀 CI/CD Github Actions

```yaml
name: Deploy Platform X
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Deploy steps...
```

## 📚 Documentation API

### 🔐 Authentication

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Verify Token
POST /api/auth/verify
{
  "token": "jwt.token.here"
}
```

### 👤 User Management

```bash
# Get Profile
GET /api/users/profile
Authorization: Bearer <token>

# Update Profile
PUT /api/users/profile
Authorization: Bearer <token>
{
  "name": "New Name",
  "avatar": "base64_image"
}
```

### 📂 Projects

```bash
# List Projects
GET /api/projects
Authorization: Bearer <token>

# Create Project
POST /api/projects
Authorization: Bearer <token>
{
  "name": "My Project",
  "description": "Project description",
  "isPublic": false
}
```

### 🪟 Windows

```bash
# Get Active Windows
GET /api/windows
Authorization: Bearer <token>

# Save Window State
POST /api/windows/state
Authorization: Bearer <token>
{
  "windowId": "uuid",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 800, "height": 600 }
}
```

## 🤝 Contribution

### 📝 Guidelines

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** sur la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### 🏗️ Standards de Code

- **TypeScript** strict mode
- **ESLint** + **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests unitaires** obligatoires pour nouvelles fonctionnalités

### 🐛 Bug Reports

Utilisez notre template d'issue pour rapporter des bugs :

```markdown
**Environnement:**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]

**Description:**
Description claire du bug...

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected vs Actual:**
Expected: ...
Actual: ...
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

Merci aux équipes de **Cursor**, **Emergent.sh** et **Lovable.dev** pour leur inspiration.

**Built with ❤️ by developers, for developers.**

---

## 📞 Support

- 📧 **Email** : support@platform-x.dev
- 💬 **Discord** : [Platform X Community](https://discord.gg/platform-x)
- 🐛 **Issues** : [GitHub Issues](https://github.com/your-org/platform-x/issues)
- 📚 **Documentation** : [docs.platform-x.dev](https://docs.platform-x.dev)

---

**🚀 Prêt à révolutionner votre expérience de développement ? Commencez dès maintenant !**