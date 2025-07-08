import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './core/services/auth.service';
import { WindowService } from './core/services/window.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'fusion-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <div class="fusion-app" [class.authenticated]="authService.isAuthenticated()" [class.dark-theme]="isDarkTheme">
      <!-- Header Navigation -->
      <fusion-header></fusion-header>
      
      <!-- Main Content -->
      <main class="main-content" [class.workspace-mode]="isWorkspaceMode()">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer (only on public pages) -->
      <fusion-footer *ngIf="!isWorkspaceMode()"></fusion-footer>
      
      <!-- Development Info (only in dev mode) -->
      <div class="dev-info" *ngIf="isDevelopment">
        <p>🚀 FusionAI v{{ version }} - Mode Développement</p>
        <p>Utilisateur: {{ authService.isAuthenticated() ? authService.getCurrentUser()?.name : 'Non connecté' }}</p>
        <p>Fenêtres ouvertes: {{ windowService.getWindowCount() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .fusion-app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .main-content {
      flex: 1;
      padding-top: 64px; /* Height of header */
      transition: all 0.3s ease;
    }

    .main-content.workspace-mode {
      padding-top: 56px; /* Smaller header in workspace */
      background: var(--workspace-bg, #1e1e1e);
    }

    /* Dark Theme */
    .fusion-app.dark-theme {
      background: #121212;
      color: #ffffff;
    }

    .fusion-app.dark-theme .main-content {
      background: #1e1e1e;
    }

    /* Development Info */
    .dev-info {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      z-index: 9999;
      opacity: 0.7;
    }

    .dev-info:hover {
      opacity: 1;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-content {
        padding-top: 56px;
      }

      .dev-info {
        display: none; /* Hide on mobile */
      }
    }

    /* Cursor-inspired styles */
    .fusion-app.authenticated {
      --primary-color: #007acc;
      --accent-color: #00d4ff;
      --workspace-bg: #1e1e1e;
    }

    /* Lovable.dev inspired elegance */
    .fusion-app {
      --border-radius: 8px;
      --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class AppComponent implements OnInit {
  version = '1.0.0';
  isDevelopment = !this.environment.production;
  isDarkTheme = true; // Default to dark theme

  constructor(
    public authService: AuthService,
    public windowService: WindowService,
    private environment: any = { production: false } // Temporary until environment is available
  ) {}

  ngOnInit(): void {
    // Initialize theme based on user preferences
    this.initializeTheme();
    
    // Load user preferences if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadUserPreferences();
    }
  }

  /**
   * Check if we're in workspace mode (authenticated user)
   */
  isWorkspaceMode(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Initialize theme based on user preferences or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('fusion_theme');
    
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      // Use system preference
      this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme();
  }

  /**
   * Load user preferences if authenticated
   */
  private loadUserPreferences(): void {
    const user = this.authService.getCurrentUser();
    if (user?.preferences) {
      this.isDarkTheme = user.preferences.theme === 'dark' || 
                        (user.preferences.theme === 'auto' && this.isDarkTheme);
      this.applyTheme();
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    const htmlElement = document.documentElement;
    
    if (this.isDarkTheme) {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark-theme');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark-theme');
    }

    // Save preference
    localStorage.setItem('fusion_theme', this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Toggle theme (for development/testing)
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
  }
}