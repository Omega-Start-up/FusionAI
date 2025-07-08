import { Injectable, signal } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
  config?: Partial<MatSnackBarConfig>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<NotificationConfig[]>([]);
  private defaultDuration = 5000;

  private readonly typeConfig = {
    success: {
      panelClass: ['success-snackbar'],
      duration: 3000,
      icon: '✅'
    },
    error: {
      panelClass: ['error-snackbar'],
      duration: 7000,
      icon: '❌'
    },
    warning: {
      panelClass: ['warning-snackbar'],
      duration: 5000,
      icon: '⚠️'
    },
    info: {
      panelClass: ['info-snackbar'],
      duration: 4000,
      icon: 'ℹ️'
    }
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Afficher une notification de succès
   */
  success(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'success'
    });
  }

  /**
   * Afficher une notification d'erreur
   */
  error(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'error'
    });
  }

  /**
   * Afficher une notification d'avertissement
   */
  warning(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'warning'
    });
  }

  /**
   * Afficher une notification d'information
   */
  info(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'info'
    });
  }

  /**
   * Afficher une notification personnalisée
   */
  show(config: NotificationConfig): void {
    const typeConfig = config.type ? this.typeConfig[config.type] : undefined;
    
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration || typeConfig?.duration || this.defaultDuration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: typeConfig?.panelClass || [],
      ...config.config
    };

    const displayMessage = typeConfig?.icon 
      ? `${typeConfig.icon} ${config.message}`
      : config.message;

    const snackBarRef = this.snackBar.open(
      displayMessage,
      config.action || 'Fermer',
      snackBarConfig
    );

    // Ajouter à la liste des notifications
    const notifications = this.notifications();
    this.notifications.set([...notifications, config]);

    // Action sur le bouton
    if (config.action) {
      snackBarRef.onAction().subscribe(() => {
        this.onNotificationAction(config);
      });
    }

    // Retirer de la liste quand fermée
    snackBarRef.afterDismissed().subscribe(() => {
      this.removeNotification(config);
    });
  }

  /**
   * Fermer toutes les notifications
   */
  dismissAll(): void {
    this.snackBar.dismiss();
    this.notifications.set([]);
  }

  /**
   * Obtenir les notifications actives
   */
  getActiveNotifications() {
    return this.notifications.asReadonly();
  }

  /**
   * Gestion des actions sur les notifications
   */
  private onNotificationAction(config: NotificationConfig): void {
    // Override cette méthode selon les besoins
    console.log('Action notification:', config);
  }

  /**
   * Retirer une notification de la liste
   */
  private removeNotification(config: NotificationConfig): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.filter(n => n !== config);
    this.notifications.set(updatedNotifications);
  }

  /**
   * Notification pour les opérations CRUD
   */
  operationSuccess(operation: string, entity: string): void {
    this.success(`${entity} ${operation} avec succès !`);
  }

  operationError(operation: string, entity: string, error?: string): void {
    const message = error 
      ? `Erreur lors de ${operation} ${entity}: ${error}`
      : `Erreur lors de ${operation} ${entity}`;
    this.error(message);
  }

  /**
   * Notifications pour l'authentification
   */
  loginSuccess(userName: string): void {
    this.success(`Bienvenue ${userName} ! 👋`);
  }

  logoutSuccess(): void {
    this.info('Déconnexion réussie. À bientôt ! 👋');
  }

  authError(message: string): void {
    this.error(`Erreur d'authentification: ${message}`);
  }

  /**
   * Notifications pour les fichiers
   */
  fileUploadSuccess(fileName: string): void {
    this.success(`Fichier "${fileName}" uploadé avec succès ! 📁`);
  }

  fileUploadError(fileName: string, error?: string): void {
    this.error(`Erreur upload "${fileName}": ${error || 'Erreur inconnue'}`);
  }

  /**
   * Notifications système
   */
  networkError(): void {
    this.error('Problème de connexion réseau. Vérifiez votre connexion internet.');
  }

  serverError(): void {
    this.error('Erreur serveur. Veuillez réessayer plus tard.');
  }

  featureNotImplemented(): void {
    this.info('Cette fonctionnalité sera bientôt disponible ! 🚧');
  }
}