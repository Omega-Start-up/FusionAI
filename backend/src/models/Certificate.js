const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // Informations de base
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },

  // Informations étudiant
  student: {
    name: {
      type: String,
      required: [true, 'Le nom de l\'étudiant est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email de l\'étudiant est requis'],
      lowercase: true
    },
    studentId: {
      type: String,
      required: [true, 'L\'ID étudiant est requis']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'La date de naissance est requise']
    }
  },

  // Informations académiques
  academic: {
    degree: {
      type: String,
      required: [true, 'Le diplôme est requis'],
      trim: true
    },
    field: {
      type: String,
      required: [true, 'Le domaine d\'étude est requis'],
      trim: true
    },
    level: {
      type: String,
      enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Other'],
      required: [true, 'Le niveau académique est requis']
    },
    gpa: {
      type: Number,
      min: [0, 'La GPA ne peut pas être négative'],
      max: [4, 'La GPA ne peut pas dépasser 4.0']
    },
    graduationDate: {
      type: Date,
      required: [true, 'La date de graduation est requise']
    },
    honors: {
      type: String,
      enum: ['Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'With Distinction', 'Pass', ''],
      default: ''
    }
  },

  // Institution émettrice
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'L\'institution est requise']
  },

  // Métadonnées blockchain
  blockchain: {
    network: {
      type: String,
      enum: ['testnet', 'mainnet'],
      default: 'testnet'
    },
    transactionHash: {
      type: String,
      required: true
    },
    blockNumber: {
      type: Number
    },
    gasUsed: {
      type: Number
    }
  },

  // Stockage IPFS
  ipfs: {
    hash: {
      type: String,
      required: true,
      unique: true
    },
    url: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },

  // Statut et validation
  status: {
    type: String,
    enum: ['pending', 'issued', 'revoked', 'expired'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  revokedDate: {
    type: Date
  },
  revokedReason: {
    type: String
  },

  // Informations de transfert
  transfer: {
    toWallet: {
      type: String,
      required: [true, 'L\'adresse du wallet de destination est requise']
    },
    transferHash: {
      type: String
    },
    transferDate: {
      type: Date
    }
  },

  // Métadonnées additionnelles
  metadata: {
    description: {
      type: String,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    tags: [{
      type: String,
      trim: true
    }],
    customFields: {
      type: mongoose.Schema.Types.Mixed
    }
  },

  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'issued', 'transferred', 'verified', 'revoked', 'updated'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: String,
      required: true
    },
    details: {
      type: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ tokenId: 1 });
certificateSchema.index({ serialNumber: 1 });
certificateSchema.index({ 'student.email': 1 });
certificateSchema.index({ 'student.studentId': 1 });
certificateSchema.index({ institution: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ 'academic.graduationDate': 1 });
certificateSchema.index({ createdAt: -1 });

// Virtual pour l'URL de vérification
certificateSchema.virtual('verificationUrl').get(function() {
  return `${process.env.FRONTEND_URL}/verify/${this.certificateId}`;
});

// Virtual pour l'URL HashScan
certificateSchema.virtual('hashScanUrl').get(function() {
  const network = this.blockchain.network === 'mainnet' ? '' : 'testnet.';
  return `https://${network}hashscan.io/token/${this.tokenId}`;
});

// Méthode pour valider le certificat
certificateSchema.methods.validate = function() {
  const now = new Date();
  
  // Vérifier si le certificat n'est pas expiré (5 ans par défaut)
  const expirationDate = new Date(this.academic.graduationDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 5);
  
  if (now > expirationDate) {
    this.status = 'expired';
    return false;
  }
  
  // Vérifier si le certificat n'est pas révoqué
  if (this.status === 'revoked') {
    return false;
  }
  
  return true;
};

// Méthode pour ajouter une entrée d'audit
certificateSchema.methods.addAuditEntry = function(action, performedBy, details = '') {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    timestamp: new Date()
  });
  return this.save();
};

// Méthode pour obtenir les données publiques
certificateSchema.methods.getPublicData = function() {
  const certificate = this.toObject();
  
  // Supprimer les données sensibles
  delete certificate.ipfs.metadata;
  delete certificate.auditTrail;
  delete certificate.transfer.toWallet;
  
  return certificate;
};

// Middleware pre-save pour générer l'ID du certificat
certificateSchema.pre('save', function(next) {
  if (this.isNew && !this.certificateId) {
    // Générer un ID unique basé sur l'institution et la date
    const institutionPrefix = this.institution.toString().slice(-4);
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    this.certificateId = `EDU-${institutionPrefix}-${datePrefix}-${randomSuffix}`;
  }
  
  if (this.isNew && !this.serialNumber) {
    // Générer un numéro de série unique
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.serialNumber = `SN-${timestamp}-${random}`;
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);