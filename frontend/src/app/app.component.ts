import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HashConnectService } from './services/hashconnect.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'EduChain Credentials';
  isWalletConnected = false;

  constructor(
    private router: Router,
    private hashConnectService: HashConnectService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.checkWalletConnection();
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
}