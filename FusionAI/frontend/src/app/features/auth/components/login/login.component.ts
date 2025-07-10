import { Component, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'auth-login',
  template: `
    <div class="login-form">
      <!-- Header -->
      <div class="form-header">
        <mat-icon class="form-icon">login</mat-icon>
        <h2 class="form-title">Connexion</h2>
        <p class="form-subtitle">Accédez à votre espace de développement</p>
      </div>

      <!-- Formulaire -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse email</mat-label>
          <input 
            matInput
            type="email"
            formControlName="email"
            [autocomplete]="formService.getAutoCompleteAttribute('email')"
            placeholder="votre@email.com"
            required>
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="formService.shouldShowFieldError(loginForm, 'email')">
            {{ formService.getFieldError(loginForm, 'email') }}
          </mat-error>
        </mat-form-field>

        <!-- Mot de passe -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mot de passe</mat-label>
          <input 
            matInput
            [type]="hidePassword() ? 'password' : 'text'"
            formControlName="password"
            [autocomplete]="formService.getAutoCompleteAttribute('password')"
            placeholder="Votre mot de passe"
            required>
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="'Hide password'"
            [attr.aria-pressed]="hidePassword()">
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="formService.shouldShowFieldError(loginForm, 'password')">
            {{ formService.getFieldError(loginForm, 'password') }}
          </mat-error>
        </mat-form-field>

        <!-- Options -->
        <div class="form-options">
          <mat-checkbox formControlName="rememberMe" class="remember-me">
            Se souvenir de moi
          </mat-checkbox>
          
          <a 
            routerLink="/auth/forgot-password" 
            class="forgot-password-link">
            Mot de passe oublié ?
          </a>
        </div>

        <!-- Submit Button -->
        <button 
          mat-raised-button 
          color="primary"
          type="submit"
          class="submit-button full-width"
          [disabled]="!formService.canSubmit(loginForm)"
          [class.loading]="isLoading()">
          
          <span *ngIf="!isLoading()">Se connecter</span>
          <span *ngIf="isLoading()" class="loading-content">
            <mat-spinner diameter="20"></mat-spinner>
            Connexion en cours...
          </span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>ou</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button 
            mat-stroked-button 
            type="button"
            class="social-button google-button"
            (click)="loginWithGoogle()">
            <mat-icon svgIcon="google"></mat-icon>
            Continuer avec Google
          </button>
          
          <button 
            mat-stroked-button 
            type="button"
            class="social-button github-button"
            (click)="loginWithGithub()">
            <mat-icon svgIcon="github"></mat-icon>
            Continuer avec GitHub
          </button>
        </div>
      </form>

      <!-- Demo Account -->
      <div class="demo-section" *ngIf="isDevelopment">
        <p class="demo-title">🚀 Mode Développement</p>
        <button 
          mat-button 
          color="accent"
          (click)="loginDemo()"
          class="demo-button">
          Connexion Demo (demo&#64;fusionai.dev)
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-form {
      padding: 2rem 0;
      max-width: 400px;
      margin: 0 auto;
    }

    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--primary-color, #667eea);
      margin-bottom: 1rem;
    }

    .form-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-primary, #1a1a1a);
    }

    .form-subtitle {
      margin: 0;
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -0.5rem 0;
    }

    .remember-me {
      font-size: 0.875rem;
    }

    .forgot-password-link {
      color: var(--primary-color, #667eea);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .forgot-password-link:hover {
      color: var(--primary-dark, #5a6fd8);
      text-decoration: underline;
    }

    .submit-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .submit-button.loading {
      pointer-events: none;
    }

    .loading-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 1rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-color, #e2e8f0);
    }

    .divider span {
      background: var(--bg-primary, white);
      padding: 0 1rem;
      color: var(--text-tertiary, #999);
      font-size: 0.875rem;
    }

    .social-login {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .social-button {
      height: 44px;
      border-radius: 8px;
      font-weight: 500;
      justify-content: flex-start;
      padding-left: 1rem;
    }

    .social-button mat-icon {
      margin-right: 0.75rem;
      width: 20px;
      height: 20px;
    }

    .google-button {
      border-color: #db4437;
      color: #db4437;
    }

    .google-button:hover {
      background-color: rgba(219, 68, 55, 0.04);
    }

    .github-button {
      border-color: #333;
      color: #333;
    }

    .github-button:hover {
      background-color: rgba(51, 51, 51, 0.04);
    }

    .demo-section {
      margin-top: 2rem;
      padding: 1rem;
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 8px;
      text-align: center;
    }

    .demo-title {
      margin: 0 0 1rem 0;
      font-weight: 600;
      color: var(--warning-color, #ff9800);
      font-size: 0.9rem;
    }

    .demo-button {
      font-size: 0.875rem;
    }

    /* Dark theme */
    :host-context(.dark-theme) .divider span {
      background: var(--bg-primary, #1e1e1e);
    }

    :host-context(.dark-theme) .github-button {
      border-color: #666;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-form {
        padding: 1rem 0;
      }
      
      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public hidePassword = signal<boolean>(true);
  public isLoading = signal<boolean>(false);
  public isDevelopment = !this.isProduction();

  constructor(
    public formService: AuthFormService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formService.createLoginForm({
      autoComplete: true
    });

    // Reset form service state
    this.formService.resetSubmissionState();
  }

  onSubmit(): void {
    if (!this.formService.validateAllFields(this.loginForm)) {
      return;
    }

    this.isLoading.set(true);
    this.formService.setSubmitting(true);

    const credentials = this.formService.getLoginCredentials(this.loginForm);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.notificationService.loginSuccess(response.user.name);
        this.router.navigate(['/workspace']);
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.notificationService.authError(
          error.error?.message || 'Erreur lors de la connexion'
        );
        this.isLoading.set(false);
        this.formService.setSubmitting(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  loginWithGoogle(): void {
    this.notificationService.featureNotImplemented();
  }

  loginWithGithub(): void {
    this.notificationService.featureNotImplemented();
  }

  loginDemo(): void {
    this.loginForm.patchValue({
      email: 'demo@fusionai.dev',
      password: 'password'
    });
    
    this.notificationService.info('Données de demo chargées !');
  }

  private isProduction(): boolean {
    // À adapter selon votre configuration d'environnement
    return false; // Mode dev pour l'instant
  }
}