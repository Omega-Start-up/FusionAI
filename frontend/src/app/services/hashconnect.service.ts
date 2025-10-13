import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HashConnect, HashConnectTypes } from 'hashconnect';

export interface WalletData {
  accountId: string;
  publicKey: string;
  isConnected: boolean;
}

export interface PairingData {
  topic: string;
  pairingString: string;
  qrString: string;
}

@Injectable({
  providedIn: 'root'
})
export class HashConnectService {
  private hashconnect: HashConnect;
  private walletDataSubject = new BehaviorSubject<WalletData>({
    accountId: '',
    publicKey: '',
    isConnected: false
  });

  public walletData$ = this.walletDataSubject.asObservable();

  constructor() {
    this.hashconnect = new HashConnect();
    this.initializeHashConnect();
  }

  private async initializeHashConnect() {
    try {
      console.log('🔗 Initialisation de HashConnect...');
      
      const appMetadata: HashConnectTypes.AppMetadata = {
        name: 'EduChain Credentials',
        description: 'Certifications académiques décentralisées via Hedera Hashgraph',
        icon: 'https://edu-chain.dev/icon.png',
        url: 'https://edu-chain.dev'
      };

      const initData = await this.hashconnect.init(appMetadata, 'testnet', false);
      
      console.log('✅ HashConnect initialisé:', initData);

      // Écouter les événements de connexion
      this.hashconnect.pairingEvent.on((pairingData) => {
        console.log('🔗 Nouvelle paire détectée:', pairingData);
        this.handlePairing(pairingData);
      });

      this.hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
        console.log('📡 Statut de connexion:', connectionStatus);
        this.handleConnectionStatusChange(connectionStatus);
      });

      // Restaurer les paires existantes
      if (initData.savedPairings.length > 0) {
        console.log('🔄 Restauration des paires existantes...');
        const pairing = initData.savedPairings[0];
        await this.hashconnect.connectToLocalWallet(pairing);
      }

    } catch (error) {
      console.error('❌ Erreur initialisation HashConnect:', error);
    }
  }

  private handlePairing(pairingData: HashConnectTypes.SavedPairingData) {
    if (pairingData.accountIds && pairingData.accountIds.length > 0) {
      const accountId = pairingData.accountIds[0];
      const publicKey = pairingData.publicKey;
      
      this.walletDataSubject.next({
        accountId,
        publicKey,
        isConnected: true
      });
      
      console.log('✅ Wallet connecté:', { accountId, publicKey });
    }
  }

  private handleConnectionStatusChange(connectionStatus: HashConnectTypes.ConnectionStatus) {
    if (connectionStatus === HashConnectTypes.ConnectionStatus.Disconnected) {
      this.walletDataSubject.next({
        accountId: '',
        publicKey: '',
        isConnected: false
      });
      console.log('❌ Wallet déconnecté');
    }
  }

  async openPairingModal(): Promise<PairingData | null> {
    try {
      console.log('🔗 Ouverture du modal de pairing...');
      
      const pairingData = await this.hashconnect.openPairingModal();
      
      if (pairingData) {
        return {
          topic: pairingData.topic,
          pairingString: pairingData.pairingString,
          qrString: pairingData.pairingString
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur ouverture modal pairing:', error);
      throw error;
    }
  }

  async connectToWallet(): Promise<boolean> {
    try {
      console.log('🔗 Connexion au wallet...');
      
      const pairingData = await this.openPairingModal();
      
      if (pairingData) {
        console.log('✅ Connexion établie');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur connexion wallet:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      console.log('🔌 Déconnexion du wallet...');
      
      const pairings = this.hashconnect.getPairings();
      if (pairings.length > 0) {
        await this.hashconnect.disconnect(pairings[0].topic);
      }
      
      this.walletDataSubject.next({
        accountId: '',
        publicKey: '',
        isConnected: false
      });
      
      console.log('✅ Wallet déconnecté');
    } catch (error) {
      console.error('❌ Erreur déconnexion wallet:', error);
    }
  }

  getCurrentWallet(): WalletData {
    return this.walletDataSubject.value;
  }

  isWalletConnected(): boolean {
    return this.walletDataSubject.value.isConnected;
  }

  getAccountId(): string {
    return this.walletDataSubject.value.accountId;
  }

  getPublicKey(): string {
    return this.walletDataSubject.value.publicKey;
  }

  async sendTransaction(transaction: any): Promise<any> {
    try {
      if (!this.isWalletConnected()) {
        throw new Error('Wallet non connecté');
      }

      console.log('📤 Envoi de transaction...');
      
      const pairings = this.hashconnect.getPairings();
      if (pairings.length === 0) {
        throw new Error('Aucune paire trouvée');
      }

      const response = await this.hashconnect.sendTransaction(
        pairings[0].topic,
        transaction
      );

      console.log('✅ Transaction envoyée:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur envoi transaction:', error);
      throw error;
    }
  }

  async requestAccountInfo(): Promise<any> {
    try {
      if (!this.isWalletConnected()) {
        throw new Error('Wallet non connecté');
      }

      console.log('ℹ️ Demande d\'informations du compte...');
      
      const pairings = this.hashconnect.getPairings();
      if (pairings.length === 0) {
        throw new Error('Aucune paire trouvée');
      }

      const response = await this.hashconnect.requestAccountInfo(
        pairings[0].topic
      );

      console.log('✅ Informations du compte:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur demande infos compte:', error);
      throw error;
    }
  }

  async requestAdditionalAccounts(): Promise<any> {
    try {
      if (!this.isWalletConnected()) {
        throw new Error('Wallet non connecté');
      }

      console.log('➕ Demande de comptes supplémentaires...');
      
      const pairings = this.hashconnect.getPairings();
      if (pairings.length === 0) {
        throw new Error('Aucune paire trouvée');
      }

      const response = await this.hashconnect.requestAdditionalAccounts(
        pairings[0].topic
      );

      console.log('✅ Comptes supplémentaires:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur demande comptes supplémentaires:', error);
      throw error;
    }
  }

  // Méthode pour obtenir l'URL HashScan
  getHashScanUrl(accountId: string, network: string = 'testnet'): string {
    const networkPrefix = network === 'mainnet' ? '' : 'testnet.';
    return `https://${networkPrefix}hashscan.io/account/${accountId}`;
  }

  // Méthode pour obtenir l'URL HashScan d'un token
  getTokenHashScanUrl(tokenId: string, network: string = 'testnet'): string {
    const networkPrefix = network === 'mainnet' ? '' : 'testnet.';
    return `https://${networkPrefix}hashscan.io/token/${tokenId}`;
  }
}