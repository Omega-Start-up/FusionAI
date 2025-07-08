import { Component } from '@angular/core';

@Component({
  selector: 'fusion-root',
  template: `
    <div class="fusion-app" [class.dark-theme]="isDarkTheme">
      <!-- Navigation Header -->
      <header class="fusion-header">
        <div class="header-content">
          <div class="brand">
            <span class="brand-text">🚀 FusionAI</span>
          </div>
          <nav class="nav-links">
            <a routerLink="/" routerLinkActive="active">Accueil</a>
            <a routerLink="/auth/login" routerLinkActive="active">Connexion</a>
          </nav>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Development Info -->
      <div class="dev-info" *ngIf="isDevelopment">
        <p>🚀 FusionAI v{{ version }} - Mode Développement</p>
        <p>Status: Ready</p>
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
export class AppComponent {
  version = '1.0.0';
  isDevelopment = true; // Set to false for production
  isDarkTheme = true;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('fusion_theme');
    
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme();
  }

  private applyTheme(): void {
    const htmlElement = document.documentElement;
    
    if (this.isDarkTheme) {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark-theme');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark-theme');
    }

    localStorage.setItem('fusion_theme', this.isDarkTheme ? 'dark' : 'light');
  }
}