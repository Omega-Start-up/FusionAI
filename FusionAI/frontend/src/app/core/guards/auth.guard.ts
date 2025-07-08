import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard d'authentification
 * Protège les routes nécessitant une authentification
 */
export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return true;
  }

  // Si pas authentifié, vérifier la validité du token stocké
  return authService.verifyToken().pipe(
    map(isValidToken => {
      if (isValidToken) {
        return true;
      }

      // Token invalide ou inexistant, rediriger vers login
      notificationService.warning(
        'Vous devez vous connecter pour accéder à cette page',
        'Connexion'
      );
      
      router.navigate(['/auth/login']);
      return false;
    })
  );
};