import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'fusion-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="not-found-page">
      <div class="not-found-container">
        <div class="not-found-content">
          <div class="error-code">404</div>
          <h1 class="error-title">Page non trouvée</h1>
          <p class="error-description">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div class="error-actions">
            <a mat-raised-button color="primary" routerLink="/">
              <mat-icon>home</mat-icon>
              Retour à l'accueil
            </a>
            <button mat-stroked-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Page précédente
            </button>
          </div>
        </div>
        <div class="error-visual">
          <div class="floating-elements">
            <div class="element element-1"></div>
            <div class="element element-2"></div>
            <div class="element element-3"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }

    .not-found-container {
      max-width: 800px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .error-code {
      font-size: 8rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.1);
      line-height: 1;
      margin-bottom: 16px;
    }

    .error-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .error-description {
      font-size: 1.2rem;
      margin-bottom: 32px;
      opacity: 0.9;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .error-actions a,
    .error-actions button {
      display: flex !important;
      align-items: center;
      gap: 8px;
      padding: 12px 24px !important;
      font-weight: 600 !important;
    }

    .error-visual {
      position: relative;
      height: 300px;
    }

    .floating-elements {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .element {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      animation: float 6s ease-in-out infinite;
    }

    .element-1 {
      width: 100px;
      height: 100px;
      top: 0;
      left: 0;
      animation-delay: 0s;
    }

    .element-2 {
      width: 60px;
      height: 60px;
      top: 120px;
      right: 40px;
      animation-delay: -2s;
    }

    .element-3 {
      width: 80px;
      height: 80px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      animation-delay: -4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }

    @media (max-width: 768px) {
      .not-found-container {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 40px;
      }

      .error-code {
        font-size: 6rem;
      }

      .error-title {
        font-size: 2rem;
      }

      .error-actions {
        justify-content: center;
      }
    }
  `]
})
export class NotFoundComponent {
  
  constructor() {}

  goBack(): void {
    window.history.back();
  }
}