# 📚 Documentation API - EduChain Credentials

Documentation complète de l'API REST pour EduChain Credentials.

## 🌐 Base URL

- **Développement** : `http://localhost:3000/api`
- **Production** : `https://api.edu-chain.dev/api`

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête `Authorization` :

```http
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Endpoints

### 🔑 Authentification

#### Connexion Institution
```http
POST /auth/institution/login
```

**Body :**
```json
{
  "email": "admin@univ-ouaga.bf",
  "password": "securePassword123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "institution": {
      "_id": "65f1234567890abcdef12345",
      "name": "Université de Ouagadougou",
      "email": "admin@univ-ouaga.bf",
      "isVerified": true,
      "isActive": true
    }
  }
}
```

#### Inscription Institution
```http
POST /auth/institution/register
```

**Body :**
```json
{
  "name": "Université de Ouagadougou",
  "email": "admin@univ-ouaga.bf",
  "password": "securePassword123",
  "address": {
    "street": "Avenue de l'Université",
    "city": "Ouagadougou",
    "country": "Burkina Faso",
    "postalCode": "01 BP 7021"
  },
  "contact": {
    "phone": "+226 25 30 70 60",
    "website": "https://www.univ-ouaga.bf"
  }
}
```

---

### 🎓 Certificats

#### Créer un Certificat
```http
POST /certificates/create
Authorization: Bearer <token>
```

**Body :**
```json
{
  "student": {
    "name": "Marie Kouassi",
    "email": "marie.kouassi@student.bf",
    "studentId": "STU2024001",
    "dateOfBirth": "1995-03-15"
  },
  "academic": {
    "degree": "Master Intelligence Artificielle",
    "field": "Informatique",
    "level": "Master",
    "gpa": 3.8,
    "graduationDate": "2025-01-10",
    "honors": "Magna Cum Laude"
  },
  "transfer": {
    "toWallet": "0.0.1234567"
  },
  "metadata": {
    "description": "Diplôme avec mention Très Bien",
    "tags": ["IA", "Master", "2025"]
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Certificat créé avec succès",
  "data": {
    "certificateId": "EDU-1234-20250113-ABC123",
    "serialNumber": "SN-1M8X9Y2Z-ABCD",
    "status": "pending",
    "student": "Marie Kouassi",
    "degree": "Master Intelligence Artificielle",
    "institution": "Université de Ouagadougou"
  }
}
```

#### Émettre un Certificat (Mint NFT)
```http
POST /certificates/{certificateId}/issue
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Certificat émis avec succès",
  "data": {
    "certificateId": "EDU-1234-20250113-ABC123",
    "tokenId": "0.0.1234567",
    "serialNumber": "SN-1M8X9Y2Z-ABCD",
    "ipfsUrl": "https://ipfs.io/ipfs/QmExampleHash123",
    "hashScanUrl": "https://testnet.hashscan.io/token/0.0.1234567",
    "transactionHash": "0.0.1234567@1641234567.123456789",
    "status": "issued"
  }
}
```

#### Récupérer les Certificats d'une Institution
```http
GET /certificates/institution/{institutionId}
Authorization: Bearer <token>
```

**Query Parameters :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `status` : Filtrer par statut (`pending`, `issued`, `revoked`, `expired`)
- `search` : Recherche textuelle

**Exemple :**
```http
GET /certificates/institution/65f1234567890abcdef12345?page=1&limit=10&status=issued&search=Marie
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "certificateId": "EDU-1234-20250113-ABC123",
        "tokenId": "0.0.1234567",
        "serialNumber": "SN-1M8X9Y2Z-ABCD",
        "student": {
          "name": "Marie Kouassi",
          "email": "marie.kouassi@student.bf",
          "studentId": "STU2024001",
          "dateOfBirth": "1995-03-15"
        },
        "academic": {
          "degree": "Master Intelligence Artificielle",
          "field": "Informatique",
          "level": "Master",
          "gpa": 3.8,
          "graduationDate": "2025-01-10",
          "honors": "Magna Cum Laude"
        },
        "status": "issued",
        "isVerified": true,
        "verificationDate": "2025-01-10T10:30:00Z",
        "createdAt": "2025-01-10T10:00:00Z",
        "updatedAt": "2025-01-10T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50
    }
  }
}
```

#### Récupérer les Certificats d'un Étudiant
```http
GET /certificates/student/{studentEmail}
```

**Query Parameters :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)

#### Vérifier un Certificat
```http
GET /certificates/verify/{certificateId}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "certificateId": "EDU-1234-20250113-ABC123",
      "tokenId": "0.0.1234567",
      "serialNumber": "SN-1M8X9Y2Z-ABCD",
      "student": {
        "name": "Marie Kouassi",
        "email": "marie.kouassi@student.bf",
        "studentId": "STU2024001",
        "dateOfBirth": "1995-03-15"
      },
      "academic": {
        "degree": "Master Intelligence Artificielle",
        "field": "Informatique",
        "level": "Master",
        "gpa": 3.8,
        "graduationDate": "2025-01-10",
        "honors": "Magna Cum Laude"
      },
      "institution": {
        "name": "Université de Ouagadougou",
        "address": {
          "street": "Avenue de l'Université",
          "city": "Ouagadougou",
          "country": "Burkina Faso",
          "postalCode": "01 BP 7021"
        }
      },
      "status": "issued",
      "isVerified": true,
      "verificationDate": "2025-01-10T10:30:00Z",
      "ipfs": {
        "hash": "QmExampleHash123",
        "url": "https://ipfs.io/ipfs/QmExampleHash123"
      },
      "blockchain": {
        "network": "testnet",
        "transactionHash": "0.0.1234567@1641234567.123456789"
      }
    },
    "isValid": true,
    "verification": {
      "url": "https://edu-chain.dev/verify/EDU-1234-20250113-ABC123",
      "hashScanUrl": "https://testnet.hashscan.io/token/0.0.1234567",
      "verifiedAt": "2025-01-13T10:30:00Z"
    }
  }
}
```

#### Récupérer un Certificat par Token ID (Public)
```http
GET /certificates/public/{tokenId}
```

#### Récupérer les Métadonnées d'un Certificat
```http
GET /certificates/{certificateId}/metadata
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmExampleHash123",
    "ipfsUrl": "https://ipfs.io/ipfs/QmExampleHash123",
    "metadata": {
      "name": "Marie Kouassi - Master Intelligence Artificielle",
      "description": "Certificat académique délivré par Université de Ouagadougou",
      "image": "https://ipfs.io/ipfs/QmDefaultCertificateImage",
      "attributes": [
        {
          "trait_type": "Student Name",
          "value": "Marie Kouassi"
        },
        {
          "trait_type": "Degree",
          "value": "Master Intelligence Artificielle"
        },
        {
          "trait_type": "Institution",
          "value": "Université de Ouagadougou"
        }
      ]
    }
  }
}
```

#### Révoquer un Certificat
```http
POST /certificates/{certificateId}/revoke
Authorization: Bearer <token>
```

**Body :**
```json
{
  "reason": "Fraude détectée"
}
```

#### Mettre à jour un Certificat
```http
PUT /certificates/{certificateId}
Authorization: Bearer <token>
```

**Body :**
```json
{
  "metadata": {
    "description": "Nouvelle description",
    "tags": ["IA", "Master", "2025", "Updated"]
  }
}
```

---

### 🏫 Institutions

#### Récupérer le Profil de l'Institution
```http
GET /institutions/profile
Authorization: Bearer <token>
```

#### Mettre à jour le Profil
```http
PUT /institutions/profile
Authorization: Bearer <token>
```

**Body :**
```json
{
  "name": "Université de Ouagadougou",
  "address": {
    "street": "Avenue de l'Université",
    "city": "Ouagadougou",
    "country": "Burkina Faso",
    "postalCode": "01 BP 7021"
  },
  "contact": {
    "phone": "+226 25 30 70 60",
    "website": "https://www.univ-ouaga.bf",
    "socialMedia": {
      "twitter": "@UnivOuaga",
      "linkedin": "university-ouagadougou"
    }
  }
}
```

#### Récupérer les Statistiques
```http
GET /institutions/stats
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "certificatesIssued": 1250,
    "totalStudents": 3200,
    "thisMonth": 45,
    "thisYear": 380,
    "lastCertificateDate": "2025-01-13T10:30:00Z",
    "averageProcessingTime": "2.5 minutes",
    "verificationRate": 98.5
  }
}
```

---

### 🔍 Vérification Publique

#### Rechercher des Certificats
```http
GET /verification/search?q={query}
```

**Query Parameters :**
- `q` : Terme de recherche (nom, email, certificat ID, token ID)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "certificateId": "EDU-1234-20250113-ABC123",
      "studentName": "Marie Kouassi",
      "degree": "Master Intelligence Artificielle",
      "institution": "Université de Ouagadougou",
      "status": "issued",
      "verificationUrl": "https://edu-chain.dev/verify/EDU-1234-20250113-ABC123"
    }
  ]
}
```

---

### 🏥 Health Check

#### Vérifier l'État de l'API
```http
GET /health
```

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2025-01-13T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 📊 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Non trouvé |
| 409 | Conflit |
| 422 | Données invalides |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

---

## 🔒 Gestion des Erreurs

### Format d'erreur standard

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Détails techniques (développement seulement)",
  "code": "ERROR_CODE"
}
```

### Codes d'erreur courants

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Erreur de validation des données |
| `AUTHENTICATION_FAILED` | Échec de l'authentification |
| `AUTHORIZATION_DENIED` | Accès non autorisé |
| `CERTIFICATE_NOT_FOUND` | Certificat non trouvé |
| `INSTITUTION_NOT_VERIFIED` | Institution non vérifiée |
| `HEDERA_ERROR` | Erreur blockchain Hedera |
| `IPFS_ERROR` | Erreur stockage IPFS |
| `RATE_LIMIT_EXCEEDED` | Limite de requêtes dépassée |

---

## 🧪 Exemples d'Utilisation

### cURL

```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/institution/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@univ-ouaga.bf","password":"securePassword123"}'

# Créer un certificat
curl -X POST http://localhost:3000/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "student": {
      "name": "Marie Kouassi",
      "email": "marie.kouassi@student.bf",
      "studentId": "STU2024001",
      "dateOfBirth": "1995-03-15"
    },
    "academic": {
      "degree": "Master Intelligence Artificielle",
      "field": "Informatique",
      "level": "Master",
      "gpa": 3.8,
      "graduationDate": "2025-01-10"
    },
    "transfer": {
      "toWallet": "0.0.1234567"
    }
  }'

# Vérifier un certificat
curl http://localhost:3000/api/certificates/verify/EDU-1234-20250113-ABC123
```

### JavaScript (Fetch)

```javascript
// Connexion
const loginResponse = await fetch('http://localhost:3000/api/auth/institution/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@univ-ouaga.bf',
    password: 'securePassword123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Créer un certificat
const certificateResponse = await fetch('http://localhost:3000/api/certificates/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    student: {
      name: 'Marie Kouassi',
      email: 'marie.kouassi@student.bf',
      studentId: 'STU2024001',
      dateOfBirth: '1995-03-15'
    },
    academic: {
      degree: 'Master Intelligence Artificielle',
      field: 'Informatique',
      level: 'Master',
      gpa: 3.8,
      graduationDate: '2025-01-10'
    },
    transfer: {
      toWallet: '0.0.1234567'
    }
  })
});

const certificateData = await certificateResponse.json();
console.log('Certificat créé:', certificateData);
```

### Python (Requests)

```python
import requests

# Connexion
login_response = requests.post('http://localhost:3000/api/auth/institution/login', json={
    'email': 'admin@univ-ouaga.bf',
    'password': 'securePassword123'
})

token = login_response.json()['data']['token']

# Créer un certificat
certificate_response = requests.post('http://localhost:3000/api/certificates/create', 
    headers={'Authorization': f'Bearer {token}'},
    json={
        'student': {
            'name': 'Marie Kouassi',
            'email': 'marie.kouassi@student.bf',
            'studentId': 'STU2024001',
            'dateOfBirth': '1995-03-15'
        },
        'academic': {
            'degree': 'Master Intelligence Artificielle',
            'field': 'Informatique',
            'level': 'Master',
            'gpa': 3.8,
            'graduationDate': '2025-01-10'
        },
        'transfer': {
            'toWallet': '0.0.1234567'
        }
    }
)

print('Certificat créé:', certificate_response.json())
```

---

## 📈 Limites et Quotas

### Limites par défaut
- **Requêtes par minute** : 100
- **Certificats par institution** : 10,000
- **Taille des métadonnées** : 10MB
- **Durée de validité JWT** : 24h

### Headers de limitation
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

---

## 🔄 Webhooks (À venir)

### Événements supportés
- `certificate.created` : Certificat créé
- `certificate.issued` : Certificat émis
- `certificate.revoked` : Certificat révoqué
- `institution.verified` : Institution vérifiée

### Configuration webhook
```http
POST /webhooks/configure
Authorization: Bearer <token>
```

**Body :**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["certificate.created", "certificate.issued"],
  "secret": "your-webhook-secret"
}
```

---

**📚 Cette documentation est maintenue à jour avec chaque version de l'API.**