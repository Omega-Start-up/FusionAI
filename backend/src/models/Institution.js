const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'institution est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  contact: {
    phone: { type: String, required: true },
    website: { type: String },
    socialMedia: {
      twitter: String,
      linkedin: String,
      facebook: String
    }
  },
  credentials: {
    hederaAccountId: { type: String },
    hederaPrivateKey: { type: String, select: false },
    hederaPublicKey: { type: String }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    certificatesIssued: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    lastCertificateDate: { type: Date }
  },
  settings: {
    autoApprove: { type: Boolean, default: false },
    notificationEmail: { type: String },
    defaultCertificateTemplate: { type: String }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches
institutionSchema.index({ email: 1 });
institutionSchema.index({ name: 1 });
institutionSchema.index({ 'address.country': 1 });
institutionSchema.index({ isVerified: 1 });

// Virtual pour l'URL de l'institution
institutionSchema.virtual('url').get(function() {
  return `/api/institutions/${this._id}`;
});

// Middleware pre-save pour hasher le mot de passe
institutionSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
institutionSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir les données publiques
institutionSchema.methods.getPublicData = function() {
  const institution = this.toObject();
  delete institution.password;
  delete institution.credentials.hederaPrivateKey;
  return institution;
};

// Méthode pour mettre à jour les statistiques
institutionSchema.methods.updateStats = function() {
  this.statistics.certificatesIssued += 1;
  this.statistics.lastCertificateDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Institution', institutionSchema);