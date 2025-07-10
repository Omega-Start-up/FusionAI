import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'auth-layout',
  template: `
    <div class="auth-layout" [class.dark-theme]="isDarkMode()">
      <!-- Background Pattern -->
      <div class="auth-background">
        <div class="gradient-overlay"></div>
        <div class="pattern-overlay"></div>
      </div>
      
      <!-- Auth Container -->
      <div class="auth-container">
        <!-- Header -->
        <header class="auth-header">
          <div class="brand" (click)="goHome()">
            <span class="brand-icon">🚀</span>
            <span class="brand-text">FusionAI</span>
          </div>
          
          <button 
            mat-icon-button 
            class="theme-toggle"
            (click)="toggleTheme()"
            matTooltip="Changer le thème">
            <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </header>
        
        <!-- Main Content -->
        <main class="auth-main">
          <!-- Page Info -->
          <div class="auth-info">
            <h1 class="auth-title">{{ pageTitle() }}</h1>
            <p class="auth-description">{{ pageDescription() }}</p>
          </div>
          
          <!-- Auth Card -->
          <div class="auth-card">
            <mat-card class="auth-form-card">
              <mat-card-content>
                <router-outlet></router-outlet>
              </mat-card-content>
            </mat-card>
          </div>
          
          <!-- Navigation Links -->
          <div class="auth-navigation">
            <ng-container *ngIf="currentRoute() === '/auth/login'">
              <p>Pas encore de compte ? 
                <a routerLink="/auth/register" class="auth-link">Créer un compte</a>
              </p>
            </ng-container>
            
            <ng-container *ngIf="currentRoute() === '/auth/register'">
              <p>Déjà un compte ? 
                <a routerLink="/auth/login" class="auth-link">Se connecter</a>
              </p>
            </ng-container>
          </div>
        </main>
        
        <!-- Footer -->
        <footer class="auth-footer">
          <div class="footer-links">
            <a href="/privacy" class="footer-link">Confidentialité</a>
            <span class="separator">•</span>
            <a href="/terms" class="footer-link">Conditions</a>
            <span class="separator">•</span>
            <a href="/help" class="footer-link">Aide</a>
          </div>
          <p class="copyright">© 2024 FusionAI. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      
      background: linear-gradient(135deg, 
        var(--primary-color, #667eea) 0%, 
        var(--accent-color, #ff6b6b) 100%);
    }

    .auth-background {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.9) 0%, 
        rgba(255, 107, 107, 0.9) 100%);
    }

    .pattern-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
      background-size: 40px 40px;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .auth-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .auth-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .brand:hover {
      transform: scale(1.05);
    }

    .brand-icon {
      font-size: 2rem;
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .auth-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      text-align: center;
    }

    .auth-info {
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .auth-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      background: linear-gradient(45deg, #fff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .auth-description {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
      line-height: 1.6;
    }

    .auth-card {
      perspective: 1000px;
    }

    .auth-form-card {
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .auth-form-card:hover {
      transform: translateY(-4px);
      box-shadow: 
        0 12px 48px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.3);
    }

    .dark-theme .auth-form-card {
      background: rgba(30, 30, 30, 0.95);
      border-color: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .auth-navigation {
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .auth-navigation p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .auth-link {
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease;
    }

    .auth-link:hover {
      border-bottom-color: white;
    }

    .auth-footer {
      text-align: center;
      color: white;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .footer-link {
      color: white;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .footer-link:hover {
      opacity: 1;
      text-decoration: underline;
    }

    .separator {
      opacity: 0.6;
    }

    .copyright {
      margin: 0;
      opacity: 0.7;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .auth-layout {
        padding: 1rem;
      }
      
      .auth-container {
        max-width: 100%;
      }
      
      .auth-title {
        font-size: 2rem;
      }
      
      .footer-links {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AuthLayoutComponent implements OnInit {
  public pageTitle = signal<string>('Bienvenue');
  public pageDescription = signal<string>('Connectez-vous à votre espace de développement');
  public currentRoute = signal<string>('');
  public isDarkMode = signal<boolean>(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Suivre les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageInfo();
      });

    // État initial
    this.updatePageInfo();
    
    // Suivre le thème
    this.isDarkMode.set(this.themeService.isDark());
  }

  private updatePageInfo(): void {
    const url = this.router.url;
    this.currentRoute.set(url);

    // Extraire les informations depuis les données de route
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const routeData = route.snapshot.data;
    if (routeData['title']) {
      this.pageTitle.set(routeData['title']);
    }
    if (routeData['description']) {
      this.pageDescription.set(routeData['description']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode.set(this.themeService.isDark());
  }
}