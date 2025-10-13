# 📚 EduChain API - Exemples d'Utilisation

## 🎓 **Émission d'un Certificat Complet**

### 1. Créer un Token NFT pour l'Institution

```bash
curl -X POST http://localhost:3000/api/certificates/token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenName": "Université de Ouagadougou Certificates",
    "tokenSymbol": "UO_EDU",
    "tokenMemo": "Certificats officiels de l'\''Université de Ouagadougou"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Token NFT créé avec succès",
  "data": {
    "tokenId": "0.0.123456",
    "tokenInfo": {
      "name": "Université de Ouagadougou Certificates",
      "symbol": "UO_EDU",
      "totalSupply": "0"
    },
    "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456"
  }
}
```

### 2. Émettre un Certificat

```bash
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Benewende Pierre",
    "studentId": "UO2025001",
    "studentEmail": "benewende.pierre@student.univ-ouaga.bf",
    "institutionName": "Université de Ouagadougou",
    "institutionId": "UO_BF",
    "institutionWebsite": "https://www.univ-ouaga.bf",
    "certificateType": "MASTER",
    "fieldOfStudy": "Intelligence Artificielle",
    "level": "MASTER",
    "graduationDate": "2025-10-13",
    "grade": "Très Bien",
    "gpa": 16.5,
    "programName": "Master en Intelligence Artificielle et Data Science",
    "department": "Informatique",
    "faculty": "Sciences et Technologies",
    "duration": "2 ans",
    "credits": 120,
    "language": "fr",
    "country": "BF",
    "tokenId": "0.0.123456",
    "recipientWalletId": "0.0.789012"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Certificat émis avec succès",
  "data": {
    "certificate": {
      "certificateId": "uuid-xxxx-xxxx-xxxx",
      "studentName": "Benewende Pierre",
      "institutionName": "Université de Ouagadougou",
      "certificateType": "MASTER",
      "typeLabel": "Master",
      "levelLabel": "Master",
      "summary": "Master en Intelligence Artificielle (Master) délivré par Université de Ouagadougou à Benewende Pierre"
    },
    "ipfs": {
      "hash": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
      "url": "https://ipfs.infura.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
    },
    "nft": {
      "tokenId": "0.0.123456",
      "serial": "1",
      "nftId": "0.0.123456/1",
      "transactionId": "0.0.123456@1634567890.123456789",
      "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456/1"
    },
    "transfer": {
      "success": true,
      "transactionId": "0.0.123456@1634567890.987654321",
      "to": "0.0.789012"
    },
    "verification": {
      "url": "http://localhost:4200/verify/0.0.123456/1",
      "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456/1"
    }
  }
}
```

---

## 🔍 **Vérification de Certificats**

### 1. Vérification Simple

```bash
curl -X GET http://localhost:3000/api/verify/0.0.123456/1
```

**Réponse :**
```json
{
  "success": true,
  "message": "Certificat trouvé et vérifié",
  "data": {
    "certificate": {
      "tokenId": "0.0.123456",
      "serial": "1",
      "nftId": "0.0.123456/1",
      "tokenName": "Université de Ouagadougou Certificates",
      "tokenSymbol": "UO_EDU",
      "verifiedAt": "2025-10-13T10:30:00.000Z"
    },
    "verification": {
      "valid": true,
      "blockchain": "Hedera Hashgraph",
      "network": "testnet",
      "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456/1"
    },
    "links": {
      "hashscan": "https://hashscan.io/testnet/token/0.0.123456/1",
      "mirrorNode": "https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.123456/nfts/1",
      "verification": "http://localhost:4200/verify/0.0.123456/1"
    }
  }
}
```

### 2. Vérification par POST

```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.123456",
    "serial": "1"
  }'
```

### 3. Vérification en Lot

```bash
curl -X POST http://localhost:3000/api/verify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "certificates": [
      {"tokenId": "0.0.123456", "serial": "1"},
      {"tokenId": "0.0.123456", "serial": "2"},
      {"tokenId": "0.0.123457", "serial": "1"}
    ]
  }'
```

---

## 🏛️ **Gestion des Institutions**

### 1. Enregistrer une Institution

```bash
curl -X POST http://localhost:3000/api/institutions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Institut Supérieur de Technologie",
    "address": "Avenue Kwame Nkrumah, Ouagadougou, Burkina Faso",
    "website": "https://www.ist-bf.net",
    "email": "contact@ist-bf.net",
    "phone": "+226 25 31 42 85",
    "country": "BF",
    "type": "INSTITUTE",
    "accreditation": "Ministère de l'\''Enseignement Supérieur du Burkina Faso",
    "description": "Institut spécialisé en technologies et sciences appliquées"
  }'
```

### 2. Récupérer une Institution

```bash
curl -X GET http://localhost:3000/api/institutions/uuid-institution-id
```

### 3. Lister les Institutions

```bash
curl -X GET "http://localhost:3000/api/institutions?page=1&limit=10&country=BF&type=UNIVERSITY"
```

---

## 📊 **Statistiques et Monitoring**

### 1. Statistiques des Certificats

```bash
curl -X GET http://localhost:3000/api/certificates/stats
```

### 2. Statistiques de Vérification

```bash
curl -X GET http://localhost:3000/api/verify/stats
```

### 3. Health Check Complet

```bash
curl -X GET http://localhost:3000/api/health/detailed
```

---

## 📱 **Génération de QR Code**

### 1. Données pour QR Code

```bash
curl -X GET http://localhost:3000/api/verify/qr/0.0.123456/1
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "qrData": {
      "type": "EduChain_Certificate_Verification",
      "version": "1.0",
      "tokenId": "0.0.123456",
      "serial": "1",
      "nftId": "0.0.123456/1",
      "verificationUrl": "http://localhost:4200/verify/0.0.123456/1",
      "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456/1",
      "blockchain": "Hedera Hashgraph",
      "network": "testnet",
      "generatedAt": "2025-10-13T10:30:00.000Z"
    },
    "qrString": "{\"type\":\"EduChain_Certificate_Verification\",...}",
    "verificationUrl": "http://localhost:4200/verify/0.0.123456/1",
    "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456/1",
    "instructions": {
      "fr": "Scannez ce QR code pour vérifier l'authenticité du certificat",
      "en": "Scan this QR code to verify the certificate authenticity"
    }
  }
}
```

---

## 🔄 **Transfert de Certificats**

### 1. Transférer un Certificat

```bash
curl -X POST http://localhost:3000/api/certificates/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.123456",
    "serial": "1",
    "recipientAccountId": "0.0.999888"
  }'
```

---

## 🔍 **Recherche et Filtrage**

### 1. Recherche de Certificats

```bash
curl -X GET "http://localhost:3000/api/certificates/search?studentName=Pierre&institutionName=Ouagadougou&certificateType=MASTER"
```

### 2. Recherche d'Institutions

```bash
curl -X GET "http://localhost:3000/api/institutions/search?q=Ouagadougou&country=BF&type=UNIVERSITY"
```

---

## 📄 **Récupération de Métadonnées IPFS**

### 1. Métadonnées d'un Certificat

```bash
curl -X GET http://localhost:3000/api/certificates/metadata/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "name": "Master - Benewende Pierre",
      "description": "Certificat Master en Intelligence Artificielle délivré par Université de Ouagadougou à Benewende Pierre",
      "attributes": [
        {"trait_type": "Étudiant", "value": "Benewende Pierre"},
        {"trait_type": "Institution", "value": "Université de Ouagadougou"},
        {"trait_type": "Type de certificat", "value": "MASTER"},
        {"trait_type": "Domaine d'étude", "value": "Intelligence Artificielle"}
      ],
      "properties": {
        "certificate_id": "uuid-xxxx-xxxx-xxxx",
        "verifiable": true,
        "blockchain": "Hedera Hashgraph"
      }
    },
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": []
    },
    "ipfsUrl": "https://ipfs.infura.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
  }
}
```

---

## ⚠️ **Gestion d'Erreurs**

### 1. Certificat Non Trouvé

```bash
curl -X GET http://localhost:3000/api/verify/0.0.999999/999
```

**Réponse (404) :**
```json
{
  "success": false,
  "error": "Certificat non trouvé",
  "message": "Aucun certificat trouvé avec ces identifiants"
}
```

### 2. Données Invalides

```bash
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "",
    "institutionName": "Test"
  }'
```

**Réponse (400) :**
```json
{
  "error": "Données du certificat invalides",
  "details": [
    {
      "field": "studentName",
      "message": "Le nom de l'étudiant est requis"
    },
    {
      "field": "certificateType",
      "message": "Le type de certificat doit être: DIPLOMA, CERTIFICATE, BADGE, ATTESTATION ou TRANSCRIPT"
    }
  ]
}
```

---

## 🚀 **Cas d'Usage Complets**

### Scénario 1: Émission Complète d'un Diplôme

1. **Institution** s'enregistre
2. **Token NFT** est créé automatiquement
3. **Certificat** est émis avec métadonnées complètes
4. **NFT** est transféré vers l'étudiant
5. **QR Code** est généré pour vérification
6. **Recruteur** vérifie via HashScan

### Scénario 2: Vérification par un Employeur

1. **Scan QR Code** sur le CV
2. **API de vérification** confirme l'authenticité
3. **Métadonnées** détaillées sont affichées
4. **Lien HashScan** pour vérification blockchain
5. **Confiance** établie instantanément

---

**🎓 Ces exemples couvrent tous les cas d'usage principaux d'EduChain Credentials !**