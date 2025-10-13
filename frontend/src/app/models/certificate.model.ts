export interface Certificate {
  _id?: string;
  certificateId: string;
  tokenId?: string;
  serialNumber: string;
  student: Student;
  academic: Academic;
  institution: Institution;
  status: CertificateStatus;
  isVerified: boolean;
  verificationDate?: string;
  revokedDate?: string;
  revokedReason?: string;
  ipfs?: IPFSData;
  blockchain?: BlockchainData;
  transfer?: TransferData;
  metadata?: CertificateMetadata;
  auditTrail?: AuditEntry[];
  verificationUrl?: string;
  hashScanUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  name: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
}

export interface Academic {
  degree: string;
  field: string;
  level: AcademicLevel;
  gpa?: number;
  graduationDate: string;
  honors?: AcademicHonors;
}

export interface Institution {
  _id?: string;
  name: string;
  email?: string;
  address?: Address;
  contact?: Contact;
  isVerified?: boolean;
  isActive?: boolean;
  statistics?: InstitutionStats;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface Contact {
  phone: string;
  website?: string;
  socialMedia?: SocialMedia;
}

export interface SocialMedia {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
}

export interface InstitutionStats {
  certificatesIssued: number;
  totalStudents: number;
  lastCertificateDate?: string;
}

export interface IPFSData {
  hash: string;
  url: string;
  metadata?: any;
}

export interface BlockchainData {
  network: 'testnet' | 'mainnet';
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: number;
}

export interface TransferData {
  toWallet: string;
  transferHash?: string;
  transferDate?: string;
}

export interface CertificateMetadata {
  description?: string;
  tags?: string[];
  customFields?: any;
}

export interface AuditEntry {
  action: AuditAction;
  timestamp: string;
  performedBy: string;
  details?: string;
}

export type CertificateStatus = 'pending' | 'issued' | 'revoked' | 'expired';
export type AcademicLevel = 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Certificate' | 'Other';
export type AcademicHonors = 'Summa Cum Laude' | 'Magna Cum Laude' | 'Cum Laude' | 'With Distinction' | 'Pass' | '';
export type AuditAction = 'created' | 'issued' | 'transferred' | 'verified' | 'revoked' | 'updated';

export interface CertificateFormData {
  student: {
    name: string;
    email: string;
    studentId: string;
    dateOfBirth: string;
  };
  academic: {
    degree: string;
    field: string;
    level: AcademicLevel;
    gpa?: number;
    graduationDate: string;
    honors?: AcademicHonors;
  };
  transfer: {
    toWallet: string;
  };
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface CertificateVerification {
  certificate: Certificate;
  isValid: boolean;
  verification: {
    url: string;
    hashScanUrl: string;
    verifiedAt: string;
  };
}

export interface CertificateSearchResult {
  certificates: Certificate[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface CertificateStats {
  total: number;
  issued: number;
  pending: number;
  revoked: number;
  expired: number;
  thisMonth: number;
  thisYear: number;
}