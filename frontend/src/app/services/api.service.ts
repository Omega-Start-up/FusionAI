import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Certificate {
  certificateId: string;
  tokenId?: string;
  serialNumber: string;
  student: {
    name: string;
    email: string;
    studentId: string;
    dateOfBirth: string;
  };
  academic: {
    degree: string;
    field: string;
    level: string;
    gpa?: number;
    graduationDate: string;
    honors?: string;
  };
  institution: {
    name: string;
    address: any;
    contact: any;
  };
  status: 'pending' | 'issued' | 'revoked' | 'expired';
  isVerified: boolean;
  verificationDate?: string;
  ipfs?: {
    hash: string;
    url: string;
  };
  blockchain?: {
    network: string;
    transactionHash: string;
  };
  verificationUrl?: string;
  hashScanUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  _id: string;
  name: string;
  email: string;
  address: any;
  contact: any;
  isVerified: boolean;
  isActive: boolean;
  statistics: {
    certificatesIssued: number;
    totalStudents: number;
    lastCertificateDate?: string;
  };
}

export interface CreateCertificateRequest {
  student: {
    name: string;
    email: string;
    studentId: string;
    dateOfBirth: string;
  };
  academic: {
    degree: string;
    field: string;
    level: string;
    gpa?: number;
    graduationDate: string;
    honors?: string;
  };
  transfer: {
    toWallet: string;
  };
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restaurer le token depuis le localStorage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.tokenSubject.next(savedToken);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.tokenSubject.next(null);
    localStorage.removeItem('auth_token');
  }

  // Authentification
  loginInstitution(email: string, password: string): Observable<ApiResponse<{ token: string; institution: Institution }>> {
    return this.http.post<ApiResponse<{ token: string; institution: Institution }>>(
      `${this.apiUrl}/auth/institution/login`,
      { email, password }
    );
  }

  registerInstitution(institutionData: any): Observable<ApiResponse<{ token: string; institution: Institution }>> {
    return this.http.post<ApiResponse<{ token: string; institution: Institution }>>(
      `${this.apiUrl}/auth/institution/register`,
      institutionData
    );
  }

  // Certificats
  createCertificate(certificateData: CreateCertificateRequest): Observable<ApiResponse<Certificate>> {
    return this.http.post<ApiResponse<Certificate>>(
      `${this.apiUrl}/certificates/create`,
      certificateData,
      { headers: this.getHeaders() }
    );
  }

  issueCertificate(certificateId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/certificates/${certificateId}/issue`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getInstitutionCertificates(institutionId: string, params?: any): Observable<ApiResponse<{ certificates: Certificate[]; pagination: any }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<{ certificates: Certificate[]; pagination: any }>>(
      `${this.apiUrl}/certificates/institution/${institutionId}`,
      { headers: this.getHeaders(), params: httpParams }
    );
  }

  getStudentCertificates(studentEmail: string, params?: any): Observable<ApiResponse<{ certificates: Certificate[]; pagination: any }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<{ certificates: Certificate[]; pagination: any }>>(
      `${this.apiUrl}/certificates/student/${studentEmail}`,
      { params: httpParams }
    );
  }

  getCertificateById(certificateId: string): Observable<ApiResponse<Certificate>> {
    return this.http.get<ApiResponse<Certificate>>(
      `${this.apiUrl}/certificates/${certificateId}`
    );
  }

  getCertificateByTokenId(tokenId: string): Observable<ApiResponse<Certificate>> {
    return this.http.get<ApiResponse<Certificate>>(
      `${this.apiUrl}/certificates/public/${tokenId}`
    );
  }

  verifyCertificate(certificateId: string): Observable<ApiResponse<{ certificate: Certificate; isValid: boolean; verification: any }>> {
    return this.http.get<ApiResponse<{ certificate: Certificate; isValid: boolean; verification: any }>>(
      `${this.apiUrl}/certificates/verify/${certificateId}`
    );
  }

  getCertificateMetadata(certificateId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/certificates/${certificateId}/metadata`,
      { headers: this.getHeaders() }
    );
  }

  revokeCertificate(certificateId: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/certificates/${certificateId}/revoke`,
      { reason },
      { headers: this.getHeaders() }
    );
  }

  updateCertificate(certificateId: string, updates: any): Observable<ApiResponse<Certificate>> {
    return this.http.put<ApiResponse<Certificate>>(
      `${this.apiUrl}/certificates/${certificateId}`,
      updates,
      { headers: this.getHeaders() }
    );
  }

  // Institutions
  getInstitutionProfile(): Observable<ApiResponse<Institution>> {
    return this.http.get<ApiResponse<Institution>>(
      `${this.apiUrl}/institutions/profile`,
      { headers: this.getHeaders() }
    );
  }

  updateInstitutionProfile(updates: any): Observable<ApiResponse<Institution>> {
    return this.http.put<ApiResponse<Institution>>(
      `${this.apiUrl}/institutions/profile`,
      updates,
      { headers: this.getHeaders() }
    );
  }

  // Statistiques
  getInstitutionStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/institutions/stats`,
      { headers: this.getHeaders() }
    );
  }

  // Vérification publique
  searchCertificates(query: string): Observable<ApiResponse<Certificate[]>> {
    return this.http.get<ApiResponse<Certificate[]>>(
      `${this.apiUrl}/verification/search`,
      { params: { q: query } }
    );
  }

  // Health check
  healthCheck(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/health`);
  }
}