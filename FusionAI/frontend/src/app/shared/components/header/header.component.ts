import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../../core/services/auth.service';
import { WindowService } from '../../../core/services/window.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'fusion-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar class="fusion-header" [class.workspace-mode]="isAuthenticated()">
      <div class="header-content">
        
        <!-- Logo / Brand -->
        <div class="brand" [routerLink]="isAuthenticated() ? '/workspace' : '/'">
          <mat-icon class="brand-icon">rocket_launch</mat-icon>
          <span class="brand-text">FusionAI</span>
        </div>

        <!-- Navigation pour utilisateurs NON connectés -->
        <nav class="public-nav" *ngIf="!isAuthenticated()">
          <a mat-button routerLink="/community" routerLinkActive="active">Community</a>
          <a mat-button routerLink="/enterprise" routerLinkActive="active">Enterprise</a>
          <a mat-button routerLink="/learn" routerLinkActive="active">Learn</a>
          <a mat-button routerLink="/shipped" routerLinkActive="active">Shipped</a>
        </nav>

        <!-- Navigation pour utilisateurs CONNECTÉS (style Cursor) -->
        <nav class="workspace-nav" *ngIf="isAuthenticated()">
          <a mat-button routerLink="/workspace" routerLinkActive="active" class="nav-item">
            <mat-icon>home</mat-icon>
            <span class="nav-text">Home</span>
          </a>
          <a mat-button routerLink="/code" routerLinkActive="active" class="nav-item">
            <mat-icon>code</mat-icon>
            <span class="nav-text">Code</span>
          </a>
          <a mat-button routerLink="/github" routerLinkActive="active" class="nav-item">
            <mat-icon>source</mat-icon>
            <span class="nav-text">GitHub</span>
          </a>
          <a mat-button routerLink="/database" routerLinkActive="active" class="nav-item">
            <mat-icon>storage</mat-icon>
            <span class="nav-text">DB</span>
          </a>
          <button mat-button class="nav-item" (click)="inviteUser()">
            <mat-icon>person_add</mat-icon>
            <span class="nav-text">Invite</span>
          </button>
          <button mat-button class="nav-item upgrade-btn" (click)="upgrade()">
            <mat-icon>arrow_upward</mat-icon>
            <span class="nav-text">Upgrade</span>
          </button>
          <button mat-button class="nav-item" (click)="publish()">
            <mat-icon>publish</mat-icon>
            <span class="nav-text">Publish</span>
          </button>
        </nav>

        <!-- Actions à droite -->
        <div class="header-actions">
          
          <!-- Pour utilisateurs NON connectés -->
          <div class="auth-actions" *ngIf="!isAuthenticated()">
            <button mat-button [matMenuTriggerFor]="loginMenu" class="login-trigger">
              Se connecter
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            
            <mat-menu #loginMenu="matMenu" class="login-menu">
              <a mat-menu-item routerLink="/auth/login">
                <mat-icon>login</mat-icon>
                <span>Connexion</span>
              </a>
              <a mat-menu-item routerLink="/auth/register">
                <mat-icon>person_add</mat-icon>
                <span>Inscription</span>
              </a>
              <mat-divider></mat-divider>
              <a mat-menu-item routerLink="/auth/forgot-password">
                <mat-icon>help</mat-icon>
                <span>Mot de passe oublié</span>
              </a>
            </mat-menu>
          </div>

          <!-- Pour utilisateurs CONNECTÉS -->
          <div class="user-actions" *ngIf="isAuthenticated()">
            <!-- Indicateur fenêtres ouvertes -->
            <button mat-icon-button 
                    class="windows-indicator" 
                    [matBadge]="windowCount()" 
                    [matBadgeHidden]="windowCount() === 0"
                    matBadgeColor="accent"
                    (click)="toggleWindowsPanel()"
                    matTooltip="Fenêtres ouvertes">
              <mat-icon>window</mat-icon>
            </button>

            <!-- Menu utilisateur -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <div class="user-avatar">
                <mat-icon *ngIf="!currentUser()?.avatar">person</mat-icon>
                <img *ngIf="currentUser()?.avatar" [src]="currentUser()?.avatar" [alt]="currentUser()?.name">
              </div>
              <span class="user-name">{{ currentUser()?.name }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="user-menu">
              <div class="user-menu-header">
                <div class="user-info">
                  <span class="user-name">{{ currentUser()?.name }}</span>
                  <span class="user-plan">Plan {{ currentUser()?.plan | titlecase }}</span>
                </div>
              </div>
              <mat-divider></mat-divider>
              
              <a mat-menu-item routerLink="/workspace/profile">
                <mat-icon>person</mat-icon>
                <span>Mon Profil</span>
              </a>
              <a mat-menu-item routerLink="/workspace/projects">
                <mat-icon>folder</mat-icon>
                <span>Mes Projets</span>
              </a>
              <a mat-menu-item routerLink="/workspace/files">
                <mat-icon>insert_drive_file</mat-icon>
                <span>Mes Fichiers</span>
              </a>
              <a mat-menu-item routerLink="/workspace/settings">
                <mat-icon>settings</mat-icon>
                <span>Paramètres</span>
              </a>
              
              <mat-divider></mat-divider>
              
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Se déconnecter</span>
              </button>
            </mat-menu>
          </div>
        </div>

      </div>
    </mat-toolbar>
  `,
  styles: [`
    .fusion-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--header-bg, #ffffff);
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .fusion-header.workspace-mode {
      background: var(--workspace-header-bg, #2d2d30);
      border-bottom-color: var(--workspace-border, #3e3e42);
      height: 56px;
      min-height: 56px;
    }

    .header-content {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 16px;
      gap: 24px;
    }

    /* Brand/Logo */
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background 0.2s ease;
    }

    .brand:hover {
      background: var(--hover-bg, rgba(0,0,0,0.04));
    }

    .brand-icon {
      color: var(--primary-color, #007acc);
      font-size: 24px;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #333);
      letter-spacing: -0.5px;
    }

    /* Navigation publique */
    .public-nav {
      display: flex;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }

    .public-nav a {
      color: var(--text-secondary, #666);
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .public-nav a:hover,
    .public-nav a.active {
      color: var(--primary-color, #007acc);
    }

    /* Navigation workspace (style Cursor) */
    .workspace-nav {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .nav-item {
      display: flex !important;
      align-items: center;
      gap: 6px;
      padding: 6px 12px !important;
      min-width: auto !important;
      height: 36px;
      border-radius: 6px;
      color: var(--workspace-text, #cccccc) !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: var(--workspace-hover, rgba(255,255,255,0.1)) !important;
      color: var(--workspace-text-hover, #ffffff) !important;
    }

    .nav-item.active {
      background: var(--workspace-active, rgba(0,122,204,0.2)) !important;
      color: var(--workspace-text-active, #ffffff) !important;
    }

    .nav-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .nav-text {
      font-size: inherit;
    }

    .upgrade-btn {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
      color: white !important;
    }

    .upgrade-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* Actions header */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Bouton de connexion */
    .login-trigger {
      display: flex !important;
      align-items: center;
      gap: 4px;
      background: var(--primary-color, #007acc) !important;
      color: white !important;
      font-weight: 500 !important;
    }

    /* Actions utilisateur connecté */
    .windows-indicator {
      color: var(--workspace-text, #cccccc);
    }

    .user-menu-trigger {
      display: flex !important;
      align-items: center;
      gap: 8px;
      padding: 4px 8px !important;
      border-radius: 6px;
      color: var(--workspace-text, #cccccc) !important;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--avatar-bg, #444);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar mat-icon {
      font-size: 16px;
      color: var(--avatar-text, #ccc);
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Menu utilisateur */
    .user-menu-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color, #eee);
    }

    .user-info .user-name {
      display: block;
      font-weight: 600;
      color: var(--text-primary, #333);
    }

    .user-plan {
      font-size: 12px;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        padding: 0 12px;
        gap: 12px;
      }

      .nav-text {
        display: none;
      }

      .nav-item {
        padding: 6px 8px !important;
        min-width: 40px !important;
      }

      .user-name {
        display: none;
      }

      .public-nav {
        gap: 4px;
      }
    }

    @media (max-width: 480px) {
      .public-nav {
        display: none;
      }
      
      .workspace-nav {
        gap: 2px;
      }
    }

    /* Dark theme */
    :host-context(.dark-theme) {
      --header-bg: #2d2d30;
      --workspace-header-bg: #2d2d30;
      --text-primary: #ffffff;
      --text-secondary: #cccccc;
      --border-color: #3e3e42;
      --hover-bg: rgba(255,255,255,0.1);
      --workspace-text: #cccccc;
      --workspace-text-hover: #ffffff;
      --workspace-hover: rgba(255,255,255,0.1);
      --workspace-active: rgba(0,122,204,0.3);
    }
  `]
})
export class HeaderComponent implements OnInit {
  windowCount = signal<number>(0);

  constructor(
    public authService: AuthService,
    public windowService: WindowService
  ) {}

  ngOnInit(): void {
    // Mettre à jour le compteur de fenêtres
    this.windowService.windows$.subscribe(windows => {
      this.windowCount.set(windows.length);
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('👋 Déconnexion réussie');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
      }
    });
  }

  inviteUser(): void {
    // TODO: Implémenter l'invitation d'utilisateurs
    console.log('🔗 Fonction invitation à implémenter');
  }

  upgrade(): void {
    // TODO: Implémenter la page d'upgrade
    console.log('⬆️ Fonction upgrade à implémenter');
  }

  publish(): void {
    // TODO: Implémenter la publication de projets
    console.log('🚀 Fonction publish à implémenter');
  }

  toggleWindowsPanel(): void {
    // TODO: Implémenter le panneau des fenêtres
    console.log('🪟 Panneau des fenêtres à implémenter');
  }
}