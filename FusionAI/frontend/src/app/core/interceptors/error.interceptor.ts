import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Intercepteur de gestion des erreurs globales
 * Affiche des notifications d'erreur à l'utilisateur
 * Log les erreurs pour le debugging
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'Une erreur inattendue s\'est produite';
      
      // Gestion spécifique selon le type d'erreur
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      }
      
      // Messages d'erreur personnalisés selon le status code
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Vous devez vous connecter pour accéder à cette ressource';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas les permissions pour cette action';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflit de données';
          break;
        case 413:
          errorMessage = 'Fichier trop volumineux';
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
          break;
      }
      
      // Ne pas afficher de notification pour certaines erreurs
      const silentErrors = [
        '/auth/verify',
        '/auth/refresh'
      ];
      
      const shouldShowNotification = !silentErrors.some(route => req.url.includes(route));
      
      if (shouldShowNotification) {
        // Afficher la notification d'erreur
        snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
      
      // Logger l'erreur pour le debugging
      console.error('🔥 Erreur HTTP:', {
        url: req.url,
        method: req.method,
        status: error.status,
        message: errorMessage,
        fullError: error
      });
      
      // Retourner l'erreur pour que les composants puissent la gérer si nécessaire
      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};