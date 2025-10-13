import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HashConnectService } from '../../services/hashconnect.service';
import { ApiService } from '../../services/api.service';
import { Certificate } from '../../models/certificate.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isWalletConnected = false;
  recentCertificates: Certificate[] = [];
  stats = {
    totalCertificates: 0,
    institutions: 0,
    students: 0,
    verified: 0
  };

  constructor(
    private router: Router,
    private hashConnectService: HashConnectService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.checkWalletConnection();
    this.loadStats();
    this.loadRecentCertificates();
  }

  checkWalletConnection(): void {
    this.hashConnectService.walletData$.subscribe(walletData => {
      this.isWalletConnected = walletData.isConnected;
    });
  }

  async connectWallet(): Promise<void> {
    try {
      const success = await this.hashConnectService.connectToWallet();
      if (success) {
        console.log('✅ Wallet connecté avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur connexion wallet:', error);
    }
  }

  loadStats(): void {
    // Simuler des statistiques pour la démo
    this.stats = {
      totalCertificates: 1250,
      institutions: 45,
      students: 3200,
      verified: 98.5
    };
  }

  loadRecentCertificates(): void {
    // Simuler des certificats récents pour la démo
    this.recentCertificates = [
      {
        certificateId: 'EDU-1234-20250113-ABC123',
        serialNumber: 'SN-1M8X9Y2Z-ABCD',
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
          graduationDate: '2025-01-10',
          honors: 'Magna Cum Laude'
        },
        institution: {
          name: 'Université de Ouagadougou',
          address: {
            street: 'Avenue de l\'Université',
            city: 'Ouagadougou',
            country: 'Burkina Faso',
            postalCode: '01 BP 7021'
          }
        },
        status: 'issued',
        isVerified: true,
        verificationDate: '2025-01-10T10:30:00Z',
        ipfs: {
          hash: 'QmExampleHash123',
          url: 'https://ipfs.io/ipfs/QmExampleHash123'
        },
        blockchain: {
          network: 'testnet',
          transactionHash: '0.0.1234567@1641234567.123456789'
        },
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:30:00Z'
      },
      {
        certificateId: 'EDU-5678-20250112-DEF456',
        serialNumber: 'SN-2N9Y0Z3A-EFGH',
        student: {
          name: 'Ahmed Traoré',
          email: 'ahmed.traore@student.bf',
          studentId: 'STU2024002',
          dateOfBirth: '1996-07-22'
        },
        academic: {
          degree: 'Licence Génie Civil',
          field: 'Ingénierie',
          level: 'Bachelor',
          gpa: 3.6,
          graduationDate: '2025-01-08',
          honors: 'Cum Laude'
        },
        institution: {
          name: 'Institut International d\'Ingénierie de l\'Eau et de l\'Environnement',
          address: {
            street: 'Rue de la Science',
            city: 'Ouagadougou',
            country: 'Burkina Faso',
            postalCode: '01 BP 594'
          }
        },
        status: 'issued',
        isVerified: true,
        verificationDate: '2025-01-08T14:20:00Z',
        ipfs: {
          hash: 'QmExampleHash456',
          url: 'https://ipfs.io/ipfs/QmExampleHash456'
        },
        blockchain: {
          network: 'testnet',
          transactionHash: '0.0.1234568@1641234568.123456789'
        },
        createdAt: '2025-01-08T14:00:00Z',
        updatedAt: '2025-01-08T14:20:00Z'
      }
    ];
  }

  navigateToVerification(): void {
    this.router.navigate(['/verify']);
  }

  navigateToInstitutionLogin(): void {
    this.router.navigate(['/institution/login']);
  }

  navigateToCertificate(certificateId: string): void {
    this.router.navigate(['/verify', certificateId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'issued': return 'success';
      case 'pending': return 'warning';
      case 'revoked': return 'error';
      case 'expired': return 'error';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'issued': return 'Émis';
      case 'pending': return 'En attente';
      case 'revoked': return 'Révoqué';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  }
}