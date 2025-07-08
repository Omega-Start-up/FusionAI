import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Guard pour les pages publiques
 * Redirige les utilisateurs déjà connectés vers le workspace
 */
export const PublicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    // Utilisateur déjà connecté, rediriger vers workspace
    router.navigate(['/workspace']);
    return false;
  }

  return true;
};