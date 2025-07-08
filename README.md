# 🚀 Platform X - Architecture Séparée

**Une plateforme de développement moderne inspirée du meilleur de Cursor, Emergent.sh et Lovable.dev**

[![Angular](https://img.shields.io/badge/Frontend-Angular%2017+-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2018+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🏗️ **Architecture Séparée**

Cette version de Platform X utilise une **architecture microservices** avec deux projets indépendants :

```
platform-x/
├── 📁 platform-x-frontend/     # Application Angular
│   ├── 📁 src/app/              # Code source Angular
│   ├── 📄 package.json          # Dépendances frontend
│   └── 📄 angular.json          # Configuration Angular
│
├── 📁 platform-x-backend/      # API Node.js
│   ├── 📁 src/                  # Code source Node.js
│   │   ├── 📄 server.js         # Serveur principal
│   │   └── 📁 routes/           # Routes API
│   └── 📄 package.json          # Dépendances backend
│
├── 📄 README.md                 # Documentation principale
└── 📄 LICENSE                   # Licence MIT
```

---

## 🚀 **Démarrage Rapide**

### 📋 **Prérequis**
- **Node.js** 18+
- **npm** 9+
- **Angular CLI** 17+

### ⚡ **Installation Express**

```bash
# 1. Cloner le repository
git clone https://github.com/your-org/platform-x.git
cd platform-x

# 2. Backend - Installer et démarrer
cd platform-x-backend
npm install
npm run dev

# 3. Frontend - Installer et démarrer (nouveau terminal)
cd ../platform-x-frontend
npm install
npm start
```

### 🌐 **URLs de l'Application**
- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Health Check** : http://localhost:3000/health

---

## 📁 **Détails des Projets**

### 🔷 **Frontend (Angular)**
```bash
cd platform-x-frontend

# Commandes disponibles
npm start                # Serveur de développement (port 4200)
npm run build            # Build de production
npm run build:prod       # Build optimisé pour production
npm test                 # Tests unitaires
npm run test:coverage    # Tests avec couverture de code
npm run lint             # Vérification du code
```

**Fonctionnalités Frontend :**
- ✅ Navigation adaptative (connecté/non connecté)
- ✅ Système de fenêtres dynamiques (style Emergent.sh)
- ✅ Design moderne avec Angular Material
- ✅ Pages publiques (Community, Entreprise, Learn, Shipped)
- ✅ Workspace authentifié avec dashboard
- ✅ Footer structuré (style Lovable.dev)

### 🔶 **Backend (Node.js)**
```bash
cd platform-x-backend

# Commandes disponibles
npm start                # Serveur production (port 3000)
npm run dev              # Serveur développement avec nodemon
npm test                 # Tests API
npm run test:coverage    # Tests avec couverture
npm run lint             # Vérification du code
```

**API Endpoints :**
- 🔐 `/api/auth/*` - Authentification (login, register, verify)
- 👤 `/api/users/*` - Gestion utilisateurs
- 📂 `/api/projects/*` - Gestion des projets
- 🪟 `/api/windows/*` - État des fenêtres
- 📄 `/api/files/*` - Gestion des fichiers

---

## 🔧 **Configuration**

### 🔷 **Frontend**
```typescript
// platform-x-frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Platform X',
  version: '1.0.0'
};
```

### 🔶 **Backend**
```bash
# platform-x-backend/.env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
JWT_SECRET=your-super-secure-secret-here
JWT_EXPIRES_IN=24h
```

---

## 🚢 **Déploiement Séparé**

### ☁️ **Frontend (Vercel/Netlify)**
```bash
cd platform-x-frontend

# Build de production
npm run build:prod

# Déployer sur Vercel
npx vercel --prod

# Ou sur Netlify
npx netlify deploy --prod --dir=dist/platform-x-frontend
```

### 🖥️ **Backend (Railway/Render/Heroku)**
```bash
cd platform-x-backend

# Build et démarrer
npm run deploy

# Ou avec Docker
docker build -t platform-x-backend .
docker run -p 3000:3000 platform-x-backend
```

### 🐳 **Docker Compose (Full Stack)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./platform-x-frontend
    ports:
      - "4200:4200"
    environment:
      - API_URL=http://backend:3000/api
  
  backend:
    build: ./platform-x-backend
    ports:
      - "3000:3000"
    environment:
      - FRONTEND_URL=http://frontend:4200
      - JWT_SECRET=production-secret-key
```

---

## 📚 **Documentation API**

### 🔐 **Authentification**
```bash
# Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "demo@platform-x.dev",
  "password": "password"
}

# Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### 👤 **Gestion Utilisateur**
```bash
# Profil utilisateur
GET http://localhost:3000/api/users/profile
Authorization: Bearer <your-jwt-token>

# Mettre à jour le profil
PUT http://localhost:3000/api/users/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "New Name",
  "preferences": {
    "theme": "dark",
    "language": "fr"
  }
}
```

### 📂 **Gestion des Projets**
```bash
# Liste des projets
GET http://localhost:3000/api/projects
Authorization: Bearer <your-jwt-token>

# Créer un projet
POST http://localhost:3000/api/projects
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Mon Nouveau Projet",
  "description": "Description du projet",
  "isPublic": false,
  "technologies": ["Angular", "Node.js"]
}
```

---

## 🔄 **Communication Frontend ↔ Backend**

### 🔷 **Service Angular (Frontend)**
```typescript
// platform-x-frontend/src/app/services/api.service.ts
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getProjects(): Observable<ProjectsResponse> {
    return this.http.get<ProjectsResponse>(`${this.apiUrl}/projects`);
  }
}
```

### 🔶 **CORS Configuration (Backend)**
```javascript
// platform-x-backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🧪 **Tests**

### 🔷 **Tests Frontend**
```bash
cd platform-x-frontend

# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests e2e
npm run e2e
```

### 🔶 **Tests Backend**
```bash
cd platform-x-backend

# Tests API
npm test

# Tests avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration
```

---

## 🌟 **Avantages de l'Architecture Séparée**

### ✅ **Avantages**
- **🔄 Déploiement indépendant** des services
- **📈 Scalabilité** différenciée (frontend vs backend)
- **👥 Équipes dédiées** (frontend et backend)
- **🔧 Technologies spécialisées** pour chaque couche
- **🚀 CI/CD optimisé** par service
- **🛡️ Sécurité renforcée** par séparation

### 📊 **Comparaison avec Monorepo**
| Aspect | Architecture Séparée | Monorepo |
|--------|---------------------|----------|
| **Déploiement** | ✅ Indépendant | ❌ Couplé |
| **Équipes** | ✅ Spécialisées | ⚠️ Partagées |
| **Performance** | ✅ Optimisée | ⚠️ Moyenne |
| **Complexité** | ⚠️ Plus élevée | ✅ Simple |
| **Maintenance** | ✅ Modulaire | ❌ Monolithique |

---

## 🤝 **Contribution**

### 🔷 **Contribuer au Frontend**
```bash
cd platform-x-frontend
git checkout -b feature/frontend-feature
# Faire vos modifications
npm run lint
npm test
git commit -m "feat(frontend): add new component"
```

### 🔶 **Contribuer au Backend**
```bash
cd platform-x-backend
git checkout -b feature/backend-feature
# Faire vos modifications
npm run lint
npm test
git commit -m "feat(backend): add new endpoint"
```

---

## 📄 **Licence**

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 **Remerciements**

Merci aux équipes de **Cursor**, **Emergent.sh** et **Lovable.dev** pour leur inspiration.

---

## 📞 **Support**

- 📧 **Email** : support@platform-x.dev
- 💬 **Discord** : [Platform X Community](https://discord.gg/platform-x)
- 🐛 **Issues Frontend** : [GitHub Issues Frontend](https://github.com/your-org/platform-x/issues?labels=frontend)
- 🐛 **Issues Backend** : [GitHub Issues Backend](https://github.com/your-org/platform-x/issues?labels=backend)

---

**🚀 Prêt à révolutionner votre expérience de développement avec une architecture moderne et séparée !**