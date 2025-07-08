import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/**
 * Intercepteur de loading automatique
 * Active/désactive automatiquement le loading pour les requêtes HTTP
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Ignorer certaines routes (comme les refresh tokens ou les vérifications)
  const skipLoadingRoutes = [
    '/auth/verify',
    '/auth/refresh',
    '/health',
    '/stats'
  ];
  
  const shouldSkipLoading = skipLoadingRoutes.some(route => req.url.includes(route));
  
  if (shouldSkipLoading) {
    return next(req);
  }
  
  // Créer un ID unique pour cette requête
  const requestId = `http-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Déterminer le message de loading basé sur la méthode HTTP
  let loadingMessage = 'Chargement...';
  
  switch (req.method.toUpperCase()) {
    case 'GET':
      loadingMessage = 'Récupération des données...';
      break;
    case 'POST':
      loadingMessage = 'Envoi des données...';
      break;
    case 'PUT':
    case 'PATCH':
      loadingMessage = 'Mise à jour...';
      break;
    case 'DELETE':
      loadingMessage = 'Suppression...';
      break;
  }
  
  // Personnaliser le message selon l'endpoint
  if (req.url.includes('/upload')) {
    loadingMessage = 'Upload en cours...';
  } else if (req.url.includes('/download')) {
    loadingMessage = 'Téléchargement...';
  } else if (req.url.includes('/login')) {
    loadingMessage = 'Connexion...';
  } else if (req.url.includes('/register')) {
    loadingMessage = 'Inscription...';
  } else if (req.url.includes('/projects')) {
    loadingMessage = req.method === 'GET' ? 'Chargement des projets...' : 'Traitement du projet...';
  } else if (req.url.includes('/files')) {
    loadingMessage = req.method === 'GET' ? 'Chargement des fichiers...' : 'Traitement du fichier...';
  } else if (req.url.includes('/windows')) {
    loadingMessage = 'Gestion des fenêtres...';
  }
  
  // Démarrer le loading
  loadingService.start(requestId, loadingMessage, 'primary');
  
  // Exécuter la requête et arrêter le loading à la fin
  return next(req).pipe(
    finalize(() => {
      loadingService.stop(requestId);
    })
  );
};