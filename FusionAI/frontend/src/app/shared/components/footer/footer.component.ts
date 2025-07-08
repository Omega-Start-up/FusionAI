import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'fusion-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <footer class="fusion-footer">
      <div class="footer-container">
        
        <!-- Main Footer Content -->
        <div class="footer-content">
          
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <mat-icon class="brand-icon">rocket_launch</mat-icon>
              <span class="brand-text">FusionAI</span>
            </div>
            <p class="brand-description">
              Révolutionner le développement avec l'intelligence artificielle. 
              Créez, collaborez et déployez plus rapidement que jamais.
            </p>
            <div class="social-links">
              <a href="https://github.com/fusionai" target="_blank" mat-icon-button aria-label="GitHub">
                <mat-icon>code</mat-icon>
              </a>
              <a href="https://twitter.com/fusionai" target="_blank" mat-icon-button aria-label="Twitter">
                <mat-icon>alternate_email</mat-icon>
              </a>
              <a href="https://linkedin.com/company/fusionai" target="_blank" mat-icon-button aria-label="LinkedIn">
                <mat-icon>business</mat-icon>
              </a>
              <a href="https://discord.gg/fusionai" target="_blank" mat-icon-button aria-label="Discord">
                <mat-icon>chat</mat-icon>
              </a>
            </div>
          </div>

          <!-- Product Links -->
          <div class="footer-section">
            <h3 class="section-title">Produit</h3>
            <ul class="section-links">
              <li><a routerLink="/learn">Documentation</a></li>
              <li><a routerLink="/community">API Reference</a></li>
              <li><a routerLink="/shipped">Exemples</a></li>
              <li><a routerLink="/learn">Tutoriels</a></li>
              <li><a routerLink="/community">Templates</a></li>
              <li><a routerLink="/enterprise">Intégrations</a></li>
            </ul>
          </div>

          <!-- Resources Links -->
          <div class="footer-section">
            <h3 class="section-title">Ressources</h3>
            <ul class="section-links">
              <li><a routerLink="/community">Communauté</a></li>
              <li><a routerLink="/learn">Blog</a></li>
              <li><a routerLink="/shipped">Changelog</a></li>
              <li><a href="/docs/status" target="_blank">Statut</a></li>
              <li><a href="/docs/help" target="_blank">Centre d'aide</a></li>
              <li><a href="/docs/roadmap" target="_blank">Roadmap</a></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div class="footer-section">
            <h3 class="section-title">Entreprise</h3>
            <ul class="section-links">
              <li><a routerLink="/enterprise">À propos</a></li>
              <li><a routerLink="/enterprise">Carrières</a></li>
              <li><a routerLink="/enterprise">Presse</a></li>
              <li><a routerLink="/enterprise">Partenaires</a></li>
              <li><a href="/contact" target="_blank">Contact</a></li>
              <li><a routerLink="/enterprise">Enterprise</a></li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div class="footer-section">
            <h3 class="section-title">Légal</h3>
            <ul class="section-links">
              <li><a href="/privacy" target="_blank">Confidentialité</a></li>
              <li><a href="/terms" target="_blank">Conditions</a></li>
              <li><a href="/cookies" target="_blank">Cookies</a></li>
              <li><a href="/security" target="_blank">Sécurité</a></li>
              <li><a href="/gdpr" target="_blank">RGPD</a></li>
              <li><a href="/accessibility" target="_blank">Accessibilité</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <div class="copyright">
              <p>&copy; {{ currentYear }} FusionAI. Tous droits réservés.</p>
            </div>
            <div class="footer-bottom-links">
              <a href="/privacy" target="_blank">Politique de confidentialité</a>
              <a href="/terms" target="_blank">Conditions d'utilisation</a>
              <a href="/cookies" target="_blank">Paramètres des cookies</a>
            </div>
            <div class="region-selector">
              <button mat-button class="region-button">
                <mat-icon>language</mat-icon>
                <span>Français (FR)</span>
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .fusion-footer {
      background: #1a1a1a;
      color: #e0e0e0;
      margin-top: auto;
      padding: 64px 0 0;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Main Footer Content */
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    /* Brand Section */
    .footer-brand {
      max-width: 300px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .brand-icon {
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .brand-text {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .brand-description {
      color: #b0b0b0;
      line-height: 1.6;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .social-links {
      display: flex;
      gap: 8px;
    }

    .social-links a {
      color: #b0b0b0;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .social-links a:hover {
      color: #667eea;
      transform: translateY(-2px);
    }

    /* Footer Sections */
    .footer-section {
      min-width: 140px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16px;
      letter-spacing: -0.2px;
    }

    .section-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .section-links li {
      margin-bottom: 12px;
    }

    .section-links a {
      color: #b0b0b0;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
      display: block;
      padding: 2px 0;
    }

    .section-links a:hover {
      color: #ffffff;
    }

    /* Footer Bottom */
    .footer-bottom {
      border-top: 1px solid #333333;
      padding: 24px 0;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .copyright {
      color: #888888;
      font-size: 14px;
    }

    .footer-bottom-links {
      display: flex;
      gap: 24px;
    }

    .footer-bottom-links a {
      color: #b0b0b0;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
    }

    .footer-bottom-links a:hover {
      color: #ffffff;
    }

    .region-selector {
      display: flex;
      align-items: center;
    }

    .region-button {
      color: #b0b0b0 !important;
      display: flex !important;
      align-items: center;
      gap: 6px;
      padding: 6px 12px !important;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 14px !important;
    }

    .region-button:hover {
      background: #333333 !important;
      color: #ffffff !important;
    }

    .region-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .footer-content {
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 32px;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }

      .footer-brand {
        grid-column: 1 / -1;
        max-width: none;
        margin-bottom: 16px;
      }

      .footer-bottom-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .footer-bottom-links {
        flex-wrap: wrap;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .footer-container {
        padding: 0 16px;
      }

      .fusion-footer {
        padding: 48px 0 0;
      }

      .social-links {
        justify-content: center;
      }

      .footer-brand {
        text-align: center;
      }

      .footer-bottom-content {
        text-align: center;
        align-items: center;
      }

      .footer-bottom-links {
        justify-content: center;
      }
    }

    /* Animation on load */
    .footer-content {
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Hover effects for sections */
    .footer-section {
      transition: transform 0.2s ease;
    }

    .footer-section:hover {
      transform: translateY(-2px);
    }

    /* Dark theme improvements */
    .fusion-footer {
      background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
      border-top: 1px solid #333333;
    }

    /* Focus states for accessibility */
    .section-links a:focus,
    .footer-bottom-links a:focus,
    .social-links a:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
      border-radius: 4px;
    }

    .region-button:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor() {}
}