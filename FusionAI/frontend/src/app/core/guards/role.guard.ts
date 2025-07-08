import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export type UserRole = 'free' | 'pro' | 'enterprise';

/**
 * Guard de vérification des rôles
 * Vérifie si l'utilisateur a le plan requis pour accéder à une route
 */
export const RoleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    // Pas d'utilisateur connecté
    router.navigate(['/auth/login']);
    return false;
  }

  // Récupérer le rôle requis depuis les données de la route
  const requiredRole = route.data?.['requiredRole'] as UserRole;
  
  if (!requiredRole) {
    // Pas de rôle spécifique requis
    return true;
  }

  // Hiérarchie des plans
  const roleHierarchy: Record<UserRole, number> = {
    free: 1,
    pro: 2,
    enterprise: 3
  };

  const userRoleLevel = roleHierarchy[currentUser.plan];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel >= requiredRoleLevel) {
    return true;
  }

  // Utilisateur n'a pas le niveau requis
  const upgradeMessage = getUpgradeMessage(requiredRole);
  
  notificationService.warning(
    upgradeMessage,
    'Upgrade',
    8000
  );

  // Rediriger vers la page d'upgrade ou d'accueil
  router.navigate(['/upgrade'], { 
    queryParams: { 
      requiredPlan: requiredRole,
      returnUrl: route.url.join('/')
    }
  });
  
  return false;
};

/**
 * Messages d'upgrade personnalisés selon le plan requis
 */
function getUpgradeMessage(requiredRole: UserRole): string {
  switch (requiredRole) {
    case 'pro':
      return 'Cette fonctionnalité nécessite un plan Pro. Mettez à niveau pour continuer.';
    case 'enterprise':
      return 'Cette fonctionnalité est réservée aux comptes Enterprise. Contactez-nous pour plus d\'informations.';
    default:
      return 'Vous devez mettre à niveau votre compte pour accéder à cette fonctionnalité.';
  }
}