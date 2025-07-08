import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'fusion-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="home-page">
      
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <h1 class="hero-title">
              Le futur du développement
              <span class="hero-highlight">commence ici</span>
            </h1>
            <p class="hero-description">
              FusionAI combine la puissance de l'intelligence artificielle avec des outils de développement 
              modernes pour créer une expérience de codage révolutionnaire.
            </p>
            <div class="hero-actions">
              <a mat-raised-button color="primary" routerLink="/auth/register" class="cta-primary">
                <mat-icon>rocket_launch</mat-icon>
                Commencer gratuitement
              </a>
              <a mat-stroked-button routerLink="/learn" class="cta-secondary">
                <mat-icon>play_circle</mat-icon>
                Voir la démo
              </a>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-number">50K+</span>
                <span class="stat-label">Développeurs</span>
              </div>
              <div class="stat">
                <span class="stat-number">1M+</span>
                <span class="stat-label">Projets créés</span>
              </div>
              <div class="stat">
                <span class="stat-number">99.9%</span>
                <span class="stat-label">Disponibilité</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="floating-windows">
              <div class="window window-1" data-window="code">
                <div class="window-header">
                  <div class="window-controls">
                    <span class="control close"></span>
                    <span class="control minimize"></span>
                    <span class="control maximize"></span>
                  </div>
                  <span class="window-title">main.ts</span>
                </div>
                <div class="window-content">
                  <div class="code-line">
                    <span class="line-number">1</span>
                    <span class="code">import {{ Component }} from '@angular/core';</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">2</span>
                    <span class="code">import {{ FusionAI }} from './fusion-ai';</span>
                  </div>
                  <div class="code-line highlighted">
                    <span class="line-number">3</span>
                    <span class="code">const ai = new FusionAI();</span>
                  </div>
                </div>
              </div>
              
              <div class="window window-2" data-window="terminal">
                <div class="window-header">
                  <div class="window-controls">
                    <span class="control close"></span>
                    <span class="control minimize"></span>
                    <span class="control maximize"></span>
                  </div>
                  <span class="window-title">Terminal</span>
                </div>
                <div class="window-content terminal">
                  <div class="terminal-line">
                    <span class="prompt">$</span>
                    <span class="command">fusion init mon-projet</span>
                  </div>
                  <div class="terminal-line">
                    <span class="output">✅ Projet créé avec succès!</span>
                  </div>
                  <div class="terminal-line">
                    <span class="prompt">$</span>
                    <span class="command cursor">_</span>
                  </div>
                </div>
              </div>

              <div class="window window-3" data-window="browser">
                <div class="window-header">
                  <div class="window-controls">
                    <span class="control close"></span>
                    <span class="control minimize"></span>
                    <span class="control maximize"></span>
                  </div>
                  <span class="window-title">localhost:4200</span>
                </div>
                <div class="window-content browser">
                  <div class="browser-content">
                    <div class="app-preview">
                      <div class="preview-header">Mon App</div>
                      <div class="preview-body">
                        <div class="preview-element"></div>
                        <div class="preview-element small"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Pourquoi choisir FusionAI ?</h2>
            <p class="section-description">
              Une plateforme complète qui révolutionne votre façon de coder
            </p>
          </div>
          
          <div class="features-grid">
            <mat-card class="feature-card">
              <mat-icon class="feature-icon">psychology</mat-icon>
              <h3 class="feature-title">IA Avancée</h3>
              <p class="feature-description">
                Assistant IA qui comprend votre code et vous aide à développer plus rapidement
              </p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">window</mat-icon>
              <h3 class="feature-title">Interface Moderne</h3>
              <p class="feature-description">
                Interface multi-fenêtres inspirée de Cursor pour une productivité maximale
              </p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">cloud_sync</mat-icon>
              <h3 class="feature-title">Collaboration</h3>
              <p class="feature-description">
                Travaillez en équipe en temps réel avec synchronisation cloud instantanée
              </p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">integration_instructions</mat-icon>
              <h3 class="feature-title">Intégrations</h3>
              <p class="feature-description">
                Connectez GitHub, bases de données et services externes en un clic
              </p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">speed</mat-icon>
              <h3 class="feature-title">Performance</h3>
              <p class="feature-description">
                Déploiement instantané et exécution ultra-rapide de vos applications
              </p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">security</mat-icon>
              <h3 class="feature-title">Sécurité</h3>
              <p class="feature-description">
                Chiffrement de bout en bout et conformité aux standards de sécurité
              </p>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="pricing-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Choisissez votre plan</h2>
            <p class="section-description">
              Des options flexibles pour tous les types de projets
            </p>
          </div>
          
          <div class="pricing-grid">
            <mat-card class="pricing-card">
              <div class="plan-header">
                <h3 class="plan-name">Free</h3>
                <div class="plan-price">
                  <span class="price">0€</span>
                  <span class="period">/mois</span>
                </div>
              </div>
              <ul class="plan-features">
                <li><mat-icon>check</mat-icon> 3 projets</li>
                <li><mat-icon>check</mat-icon> 500 MB stockage</li>
                <li><mat-icon>check</mat-icon> Support communauté</li>
                <li><mat-icon>close</mat-icon> Collaboration équipe</li>
              </ul>
              <a mat-raised-button routerLink="/auth/register" class="plan-button">Commencer</a>
            </mat-card>

            <mat-card class="pricing-card featured">
              <div class="plan-badge">Populaire</div>
              <div class="plan-header">
                <h3 class="plan-name">Pro</h3>
                <div class="plan-price">
                  <span class="price">29€</span>
                  <span class="period">/mois</span>
                </div>
              </div>
              <ul class="plan-features">
                <li><mat-icon>check</mat-icon> Projets illimités</li>
                <li><mat-icon>check</mat-icon> 50 GB stockage</li>
                <li><mat-icon>check</mat-icon> Support prioritaire</li>
                <li><mat-icon>check</mat-icon> Collaboration équipe</li>
                <li><mat-icon>check</mat-icon> IA avancée</li>
              </ul>
              <a mat-raised-button color="primary" routerLink="/auth/register" class="plan-button">Essayer Pro</a>
            </mat-card>

            <mat-card class="pricing-card">
              <div class="plan-header">
                <h3 class="plan-name">Enterprise</h3>
                <div class="plan-price">
                  <span class="price">Custom</span>
                </div>
              </div>
              <ul class="plan-features">
                <li><mat-icon>check</mat-icon> Tout de Pro</li>
                <li><mat-icon>check</mat-icon> Stockage illimité</li>
                <li><mat-icon>check</mat-icon> Support dédié</li>
                <li><mat-icon>check</mat-icon> Déploiement on-premise</li>
                <li><mat-icon>check</mat-icon> SLA personnalisé</li>
              </ul>
              <a mat-stroked-button routerLink="/enterprise" class="plan-button">Nous contacter</a>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-content">
            <h2 class="cta-title">Prêt à révolutionner votre développement ?</h2>
            <p class="cta-description">
              Rejoignez plus de 50 000 développeurs qui utilisent déjà FusionAI
            </p>
            <a mat-raised-button color="primary" routerLink="/auth/register" class="cta-button">
              <mat-icon>rocket_launch</mat-icon>
              Commencer maintenant
            </a>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 120px 0 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 24px;
    }

    .hero-highlight {
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-description {
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
    }

    .cta-primary {
      background: linear-gradient(45deg, #ff6b6b, #feca57) !important;
      color: white !important;
      padding: 12px 24px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
    }

    .cta-secondary {
      border-color: rgba(255,255,255,0.5) !important;
      color: white !important;
      padding: 12px 24px !important;
      font-size: 1.1rem !important;
    }

    .hero-stats {
      display: flex;
      gap: 32px;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #feca57;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* Floating Windows Animation */
    .hero-visual {
      position: relative;
      height: 500px;
    }

    .floating-windows {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .window {
      position: absolute;
      background: #1e1e1e;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      overflow: hidden;
      animation: float 6s ease-in-out infinite;
    }

    .window-1 {
      width: 300px;
      height: 200px;
      top: 50px;
      left: 0;
      animation-delay: 0s;
    }

    .window-2 {
      width: 280px;
      height: 160px;
      top: 200px;
      right: 40px;
      animation-delay: -2s;
    }

    .window-3 {
      width: 250px;
      height: 180px;
      top: 0;
      right: 0;
      animation-delay: -4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(1deg); }
    }

    .window-header {
      background: #2d2d30;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #3e3e42;
    }

    .window-controls {
      display: flex;
      gap: 6px;
    }

    .control {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .control.close { background: #ff5f57; }
    .control.minimize { background: #ffbd2e; }
    .control.maximize { background: #28ca42; }

    .window-title {
      color: #cccccc;
      font-size: 13px;
      font-weight: 500;
    }

    .window-content {
      padding: 16px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }

    .code-line {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
      padding: 2px 0;
    }

    .code-line.highlighted {
      background: rgba(0, 122, 204, 0.2);
      margin: 0 -16px;
      padding: 2px 16px;
    }

    .line-number {
      color: #6e7681;
      width: 20px;
      text-align: right;
    }

    .code {
      color: #e1e4e8;
    }

    .terminal {
      background: #0d1117;
      color: #58a6ff;
    }

    .terminal-line {
      margin-bottom: 8px;
      display: flex;
      gap: 8px;
    }

    .prompt {
      color: #7c3aed;
    }

    .command {
      color: #e1e4e8;
    }

    .output {
      color: #56d364;
    }

    .cursor {
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .browser {
      background: #ffffff;
      color: #000;
    }

    .app-preview {
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      overflow: hidden;
    }

    .preview-header {
      background: #f6f8fa;
      padding: 8px 12px;
      font-size: 11px;
      border-bottom: 1px solid #e1e4e8;
    }

    .preview-body {
      padding: 12px;
      height: 60px;
    }

    .preview-element {
      background: #0969da;
      height: 8px;
      border-radius: 2px;
      margin-bottom: 8px;
    }

    .preview-element.small {
      width: 60%;
      background: #6f42c1;
    }

    /* Sections */
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 20px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 64px;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      color: #1a1a1a;
    }

    .section-description {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Features */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
      border-radius: 16px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .feature-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .feature-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a1a1a;
    }

    .feature-description {
      color: #666;
      line-height: 1.6;
    }

    /* Pricing */
    .pricing-section {
      background: #f8fafc;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 32px;
      max-width: 900px;
      margin: 0 auto;
    }

    .pricing-card {
      text-align: center;
      padding: 32px 24px;
      border-radius: 16px;
      position: relative;
      transition: transform 0.3s ease;
    }

    .pricing-card:hover {
      transform: translateY(-4px);
    }

    .pricing-card.featured {
      border: 2px solid #667eea;
      transform: scale(1.05);
    }

    .plan-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #667eea;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .plan-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .plan-price {
      margin-bottom: 24px;
    }

    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .period {
      color: #666;
      font-size: 1rem;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin-bottom: 32px;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      justify-content: center;
    }

    .plan-features mat-icon {
      font-size: 18px;
    }

    .plan-features mat-icon[ng-reflect-font-icon="check"] {
      color: #28a745;
    }

    .plan-features mat-icon[ng-reflect-font-icon="close"] {
      color: #dc3545;
    }

    .plan-button {
      width: 100%;
      padding: 12px !important;
      font-weight: 600 !important;
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .cta-content {
      text-align: center;
    }

    .cta-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .cta-description {
      font-size: 1.2rem;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .cta-button {
      background: linear-gradient(45deg, #ff6b6b, #feca57) !important;
      color: white !important;
      padding: 16px 32px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .hero-stats {
        justify-content: center;
      }

      .section-title {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .pricing-grid {
        grid-template-columns: 1fr;
      }

      .pricing-card.featured {
        transform: none;
      }
    }
  `]
})
export class HomeComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Animations d'entrée ou autres initialisations
  }
}