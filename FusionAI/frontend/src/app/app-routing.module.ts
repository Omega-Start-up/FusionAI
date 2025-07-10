import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // === ROUTES PUBLIQUES (Temporaire - standalone components) ===
  {
    path: '',
    canActivate: [PublicGuard],
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  // Pages temporaires (redirigent vers home pour l'instant)
  {
    path: 'community',
    canActivate: [PublicGuard],
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'enterprise',
    canActivate: [PublicGuard],
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'learn',
    canActivate: [PublicGuard],
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'shipped',
    canActivate: [PublicGuard],
    redirectTo: '/',
    pathMatch: 'full'
  },

  // === AUTHENTIFICATION (Modules Feature) ===
  {
    path: 'auth',
    canActivate: [PublicGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // === WORKSPACE AUTHENTIFIÉ (Modules Feature) ===
  {
    path: 'workspace',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/workspace/workspace.module').then(m => m.WorkspaceModule)
  },

  // === WINDOWS DYNAMIQUES ===
  {
    path: 'windows',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/windows/windows.module').then(m => m.WindowsModule)
  },

  // === FEATURES À IMPLÉMENTER PLUS TARD ===
  // {
  //   path: 'features',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule)
  // },

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
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Configuration du router
    enableTracing: false, // Set to true for debugging
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    
    // Router features modernes (Angular 17+)
    bindToComponentInputs: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }