import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '@environments/environment';

/**
 * Intercepteur d'authentification JWT
 * Ajoute automatiquement le token d'accès aux requêtes API
 * Gère le renouvellement automatique des tokens expirés
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ignorer les routes qui n'ont pas besoin d'authentification
  const publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/verify',
    '/health'
  ];
  
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  const isApiCall = req.url.includes(environment.apiUrl);
  
  // Si ce n'est pas un appel API ou si c'est une route publique, continuer sans modification
  if (!isApiCall || isPublicRoute) {
    return next(req);
  }
  
  // Obtenir le token d'accès
  const accessToken = authService.getAccessToken();
  
  // Si pas de token, continuer sans modification
  if (!accessToken) {
    return next(req);
  }
  
  // Ajouter le token Authorization header
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
  });
  
  // Exécuter la requête avec gestion du renouvellement de token
  return next(authReq).pipe(
    catchError(error => {
      // Si erreur 401 (Unauthorized), tenter de renouveler le token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Refaire la requête avec le nouveau token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`)
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Si le renouvellement échoue, déconnecter l'utilisateur
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};