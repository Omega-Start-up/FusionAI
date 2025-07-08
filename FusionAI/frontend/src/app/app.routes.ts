import { Routes } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from './core/services/auth.service';

// Guards
const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

const publicGuard = () => {
  const authService = inject(AuthService);
  return !authService.isAuthenticated();
};

export const routes: Routes = [
  // === ROUTES PUBLIQUES ===
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [publicGuard],
    title: 'FusionAI - Plateforme de Développement Moderne'
  },
  {
    path: 'community',
    loadComponent: () => import('./pages/community/community.component').then(m => m.CommunityComponent),
    canActivate: [publicGuard],
    title: 'Communauté - FusionAI'
  },
  {
    path: 'enterprise',
    loadComponent: () => import('./pages/enterprise/enterprise.component').then(m => m.EnterpriseComponent),
    canActivate: [publicGuard],
    title: 'Enterprise - FusionAI'
  },
  {
    path: 'learn',
    loadComponent: () => import('./pages/learn/learn.component').then(m => m.LearnComponent),
    canActivate: [publicGuard],
    title: 'Apprendre - FusionAI'
  },
  {
    path: 'shipped',
    loadComponent: () => import('./pages/shipped/shipped.component').then(m => m.ShippedComponent),
    canActivate: [publicGuard],
    title: 'Projets Livrés - FusionAI'
  },

  // === AUTHENTIFICATION ===
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [publicGuard],
        title: 'Connexion - FusionAI'
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [publicGuard],
        title: 'Inscription - FusionAI'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [publicGuard],
        title: 'Mot de passe oublié - FusionAI'
      }
    ]
  },

  // === WORKSPACE AUTHENTIFIÉ ===
  {
    path: 'workspace',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/workspace/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - FusionAI'
      },
      {
        path: 'projects',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/workspace/projects/projects-list/projects-list.component').then(m => m.ProjectsListComponent),
            title: 'Mes Projets - FusionAI'
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/workspace/projects/project-create/project-create.component').then(m => m.ProjectCreateComponent),
            title: 'Nouveau Projet - FusionAI'
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/workspace/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
            title: 'Projet - FusionAI'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/workspace/projects/project-edit/project-edit.component').then(m => m.ProjectEditComponent),
            title: 'Modifier Projet - FusionAI'
          }
        ]
      },
      {
        path: 'files',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/workspace/files/files-list/files-list.component').then(m => m.FilesListComponent),
            title: 'Mes Fichiers - FusionAI'
          },
          {
            path: 'upload',
            loadComponent: () => import('./pages/workspace/files/file-upload/file-upload.component').then(m => m.FileUploadComponent),
            title: 'Upload Fichiers - FusionAI'
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/workspace/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Mon Profil - FusionAI'
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/workspace/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Paramètres - FusionAI'
      }
    ]
  },

  // === ROUTES SPÉCIALES ===
  {
    path: 'code',
    loadComponent: () => import('./components/windows/code-window/code-window.component').then(m => m.CodeWindowComponent),
    canActivate: [authGuard],
    title: 'Éditeur de Code - FusionAI'
  },
  {
    path: 'github',
    loadComponent: () => import('./components/windows/github-window/github-window.component').then(m => m.GitHubWindowComponent),
    canActivate: [authGuard],
    title: 'GitHub - FusionAI'
  },
  {
    path: 'database',
    loadComponent: () => import('./components/windows/database-window/database-window.component').then(m => m.DatabaseWindowComponent),
    canActivate: [authGuard],
    title: 'Base de Données - FusionAI'
  },

  // === REDIRECTIONS ===
  {
    path: 'dashboard',
    redirectTo: '/workspace',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },

  // === PAGE 404 ===
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page non trouvée - FusionAI'
  }
];