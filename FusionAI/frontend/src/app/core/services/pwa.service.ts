import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Observable, fromEvent, BehaviorSubject, merge, NEVER } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWANotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: PWANotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  private platformId = inject(PLATFORM_ID);
  private swUpdate = inject(SwUpdate, { optional: true });

  private _isInstallable = signal(false);
  private _isInstalled = signal(false);
  private _isUpdateAvailable = signal(false);
  private _notificationPermission = signal<NotificationPermission>('default');
  private _isOnline = signal(true);
  private _installPromptEvent: PWAInstallPrompt | null = null;

  // PWA State
  readonly isInstallable = this._isInstallable.asReadonly();
  readonly isInstalled = this._isInstalled.asReadonly();
  readonly isUpdateAvailable = this._isUpdateAvailable.asReadonly();
  readonly notificationPermission = this._notificationPermission.asReadonly();
  readonly isOnline = this._isOnline.asReadonly();

  // Computed properties
  readonly canInstall = computed(() => this.isInstallable() && !this.isInstalled());
  readonly canNotify = computed(() => this.notificationPermission() === 'granted');
  readonly isPWASupported = computed(() => this.isBrowser() && 'serviceWorker' in navigator);

  constructor() {
    if (this.isBrowser()) {
      this.initializePWA();
      this.setupInstallPrompt();
      this.setupOnlineStatus();
      this.setupServiceWorker();
      this.checkInstallStatus();
      this.checkNotificationPermission();
    }
  }

  /**
   * Vérifier si on est dans un navigateur
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initialiser les fonctionnalités PWA
   */
  private initializePWA(): void {
    // Détecter si l'app est déjà installée
    if ('matchMedia' in window) {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      this._isInstalled.set(isStandalone || isFullscreen);
    }
  }

  /**
   * Configurer la détection du prompt d'installation
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this._installPromptEvent = event as PWAInstallPrompt;
      this._isInstallable.set(true);
      console.log('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      this._isInstalled.set(true);
      this._isInstallable.set(false);
      this._installPromptEvent = null;
      console.log('PWA installed');
    });
  }

  /**
   * Configurer la détection du statut en ligne/hors ligne
   */
  private setupOnlineStatus(): void {
    this._isOnline.set(navigator.onLine);

    window.addEventListener('online', () => {
      this._isOnline.set(true);
    });

    window.addEventListener('offline', () => {
      this._isOnline.set(false);
    });
  }

  /**
   * Configurer le service worker
   */
  private setupServiceWorker(): void {
    if (!this.swUpdate) {
      console.warn('Service Worker not available');
      return;
    }

    // Détecter les mises à jour disponibles
    this.swUpdate.versionUpdates.pipe(
      filter((event: VersionEvent) => event.type === 'VERSION_READY')
    ).subscribe(() => {
      this._isUpdateAvailable.set(true);
      console.log('App update available');
    });

    // Détecter quand l'app est mise à jour
    this.swUpdate.versionUpdates.pipe(
      filter((event: VersionEvent) => event.type === 'VERSION_READY')
    ).subscribe(() => {
      console.log('App update ready');
    });
  }

  /**
   * Vérifier le statut d'installation
   */
  private checkInstallStatus(): void {
    // Détecter si l'app tourne en mode standalone
    if ('matchMedia' in window) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      this._isInstalled.set(mediaQuery.matches);
      
      mediaQuery.addEventListener('change', (e) => {
        this._isInstalled.set(e.matches);
      });
    }
  }

  /**
   * Vérifier les permissions de notification
   */
  private checkNotificationPermission(): void {
    if ('Notification' in window) {
      this._notificationPermission.set(Notification.permission);
    }
  }

  /**
   * Installer l'application PWA
   */
  async installApp(): Promise<boolean> {
    if (!this._installPromptEvent) {
      console.warn('No install prompt available');
      return false;
    }

    try {
      await this._installPromptEvent.prompt();
      const result = await this._installPromptEvent.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this._isInstallable.set(false);
        this._installPromptEvent = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  }

  /**
   * Appliquer la mise à jour de l'application
   */
  async applyUpdate(): Promise<void> {
    if (!this.swUpdate) {
      console.warn('Service Worker not available');
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      this._isUpdateAvailable.set(false);
      
      // Recharger la page pour appliquer la mise à jour
      window.location.reload();
    } catch (error) {
      console.error('Error applying update:', error);
    }
  }

  /**
   * Demander la permission pour les notifications
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this._notificationPermission.set(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Afficher une notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    // Vérifier les permissions
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      // Si on utilise un service worker, envoyer via le SW
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        await this.sendNotificationToSW(options);
      } else {
        // Sinon, afficher directement
        this.createDirectNotification(options);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Envoyer une notification via le service worker
   */
  private async sendNotificationToSW(options: NotificationOptions): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/assets/icons/icon-192x192.png',
      badge: options.badge || '/assets/icons/badge-72x72.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent
    });
  }

  /**
   * Créer une notification directe
   */
  private createDirectNotification(options: NotificationOptions): void {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/assets/icons/icon-192x192.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent
    });

    // Gérer les clics sur la notification
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
    };

    // Fermer automatiquement après 5 secondes si non interactive
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  /**
   * S'abonner aux notifications push
   */
  async subscribeToPush(): Promise<PushSubscriptionInfo | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.vapidPublicKey || '')
      });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * Se désabonner des notifications push
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        return await subscription.unsubscribe();
      }
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations de l'appareil
   */
  getDeviceInfo(): any {
    if (!this.isBrowser()) {
      return null;
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection,
      isStandalone: this.isInstalled(),
      isInstallable: this.isInstallable(),
      notificationPermission: this.notificationPermission()
    };
  }

  /**
   * Utilities
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}