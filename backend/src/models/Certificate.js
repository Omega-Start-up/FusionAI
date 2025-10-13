const Joi = require('joi');

/**
 * Schéma de validation pour un certificat
 */
const certificateSchema = Joi.object({
  // Informations de l'étudiant
  studentName: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Le nom de l\'étudiant est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
  
  studentId: Joi.string().max(50).optional()
    .messages({
      'string.max': 'L\'ID étudiant ne peut pas dépasser 50 caractères'
    }),

  studentEmail: Joi.string().email().optional()
    .messages({
      'string.email': 'L\'email de l\'étudiant doit être valide'
    }),

  // Informations de l'institution
  institutionName: Joi.string().min(2).max(200).required()
    .messages({
      'string.empty': 'Le nom de l\'institution est requis',
      'string.min': 'Le nom de l\'institution doit contenir au moins 2 caractères',
      'string.max': 'Le nom de l\'institution ne peut pas dépasser 200 caractères'
    }),

  institutionId: Joi.string().max(50).optional(),
  institutionAddress: Joi.string().max(500).optional(),
  institutionWebsite: Joi.string().uri().optional(),
  institutionLogoUrl: Joi.string().uri().optional(),
  institutionAccreditation: Joi.string().max(200).optional(),

  // Informations du certificat
  certificateType: Joi.string().valid(
    'DIPLOMA', 'CERTIFICATE', 'BADGE', 'ATTESTATION', 'TRANSCRIPT'
  ).required()
    .messages({
      'any.only': 'Le type de certificat doit être: DIPLOMA, CERTIFICATE, BADGE, ATTESTATION ou TRANSCRIPT'
    }),

  certificateId: Joi.string().max(100).optional(),
  
  fieldOfStudy: Joi.string().min(2).max(200).required()
    .messages({
      'string.empty': 'Le domaine d\'étude est requis',
      'string.min': 'Le domaine d\'étude doit contenir au moins 2 caractères'
    }),

  level: Joi.string().valid(
    'HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD', 'PROFESSIONAL', 'CONTINUING_EDUCATION'
  ).required()
    .messages({
      'any.only': 'Le niveau doit être: HIGH_SCHOOL, BACHELOR, MASTER, PHD, PROFESSIONAL ou CONTINUING_EDUCATION'
    }),

  // Dates
  graduationDate: Joi.date().iso().max('now').required()
    .messages({
      'date.base': 'La date d\'obtention doit être une date valide',
      'date.max': 'La date d\'obtention ne peut pas être dans le futur'
    }),

  issuedAt: Joi.date().iso().optional(),

  // Détails académiques
  grade: Joi.string().max(50).optional(),
  gpa: Joi.number().min(0).max(20).optional(),
  credits: Joi.number().min(0).optional(),
  duration: Joi.string().max(50).optional(),

  // Programme d'études
  programName: Joi.string().max(200).optional(),
  programCode: Joi.string().max(50).optional(),
  department: Joi.string().max(200).optional(),
  faculty: Joi.string().max(200).optional(),
  specialization: Joi.string().max(200).optional(),

  // Métadonnées
  language: Joi.string().length(2).default('fr').optional(),
  country: Joi.string().length(2).optional(),

  // URLs des fichiers
  imageUrl: Joi.string().uri().optional(),
  certificatePdfUrl: Joi.string().uri().optional(),
  transcriptUrl: Joi.string().uri().optional(),
  diplomaSupplementUrl: Joi.string().uri().optional(),
  qrCodeUrl: Joi.string().uri().optional(),

  // Signataires
  signatories: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      title: Joi.string().required(),
      signature: Joi.string().uri().optional()
    })
  ).optional(),

  // Wallet de destination (optionnel)
  recipientWalletId: Joi.string().pattern(/^0\.0\.\d+$/).optional()
    .messages({
      'string.pattern.base': 'L\'ID du wallet doit être au format Hedera (0.0.xxxxx)'
    })
});

/**
 * Schéma de validation pour la création d'un token
 */
const tokenCreationSchema = Joi.object({
  tokenName: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': 'Le nom du token est requis',
      'string.max': 'Le nom du token ne peut pas dépasser 100 caractères'
    }),

  tokenSymbol: Joi.string().min(1).max(10).required()
    .messages({
      'string.empty': 'Le symbole du token est requis',
      'string.max': 'Le symbole du token ne peut pas dépasser 10 caractères'
    }),

  tokenMemo: Joi.string().max(100).optional()
    .messages({
      'string.max': 'Le mémo du token ne peut pas dépasser 100 caractères'
    })
});

/**
 * Schéma de validation pour la vérification d'un certificat
 */
const verificationSchema = Joi.object({
  tokenId: Joi.string().pattern(/^0\.0\.\d+$/).required()
    .messages({
      'string.pattern.base': 'L\'ID du token doit être au format Hedera (0.0.xxxxx)'
    }),

  serial: Joi.string().pattern(/^\d+$/).required()
    .messages({
      'string.pattern.base': 'Le numéro de série doit être un nombre'
    })
});

/**
 * Schéma de validation pour le transfert d'un NFT
 */
const transferSchema = Joi.object({
  tokenId: Joi.string().pattern(/^0\.0\.\d+$/).required()
    .messages({
      'string.pattern.base': 'L\'ID du token doit être au format Hedera (0.0.xxxxx)'
    }),

  serial: Joi.string().pattern(/^\d+$/).required()
    .messages({
      'string.pattern.base': 'Le numéro de série doit être un nombre'
    }),

  recipientAccountId: Joi.string().pattern(/^0\.0\.\d+$/).required()
    .messages({
      'string.pattern.base': 'L\'ID du compte destinataire doit être au format Hedera (0.0.xxxxx)'
    })
});

/**
 * Classe Certificate pour la gestion des certificats
 */
class Certificate {
  constructor(data) {
    this.data = data;
    this.createdAt = new Date();
  }

  /**
   * Valide les données du certificat
   * @returns {Object} Résultat de la validation
   */
  validate() {
    const { error, value } = certificateSchema.validate(this.data, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      return {
        valid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }

    this.data = value;
    return { valid: true, data: value };
  }

  /**
   * Génère un ID unique pour le certificat
   * @returns {string} ID du certificat
   */
  generateId() {
    const { v4: uuidv4 } = require('uuid');
    return this.data.certificateId || uuidv4();
  }

  /**
   * Convertit le type de certificat en libellé français
   * @returns {string} Libellé français
   */
  getTypeLabel() {
    const types = {
      'DIPLOMA': 'Diplôme',
      'CERTIFICATE': 'Certificat',
      'BADGE': 'Badge',
      'ATTESTATION': 'Attestation',
      'TRANSCRIPT': 'Relevé de notes'
    };
    return types[this.data.certificateType] || this.data.certificateType;
  }

  /**
   * Convertit le niveau en libellé français
   * @returns {string} Libellé français
   */
  getLevelLabel() {
    const levels = {
      'HIGH_SCHOOL': 'Lycée',
      'BACHELOR': 'Licence',
      'MASTER': 'Master',
      'PHD': 'Doctorat',
      'PROFESSIONAL': 'Professionnel',
      'CONTINUING_EDUCATION': 'Formation continue'
    };
    return levels[this.data.level] || this.data.level;
  }

  /**
   * Génère un résumé du certificat
   * @returns {string} Résumé
   */
  getSummary() {
    return `${this.getTypeLabel()} en ${this.data.fieldOfStudy} (${this.getLevelLabel()}) délivré par ${this.data.institutionName} à ${this.data.studentName}`;
  }

  /**
   * Convertit en format JSON pour l'API
   * @returns {Object} Données formatées
   */
  toJSON() {
    return {
      ...this.data,
      certificateId: this.generateId(),
      typeLabel: this.getTypeLabel(),
      levelLabel: this.getLevelLabel(),
      summary: this.getSummary(),
      createdAt: this.createdAt.toISOString()
    };
  }
}

module.exports = {
  Certificate,
  certificateSchema,
  tokenCreationSchema,
  verificationSchema,
  transferSchema
};