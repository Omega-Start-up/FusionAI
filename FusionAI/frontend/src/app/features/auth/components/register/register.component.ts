import { Component, OnInit, signal, computed } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'auth-register',
  template: `
    <div class="register-form">
      <!-- Header -->
      <div class="form-header">
        <mat-icon class="form-icon">person_add</mat-icon>
        <h2 class="form-title">Inscription</h2>
        <p class="form-subtitle">Créez votre compte FusionAI gratuit</p>
      </div>

      <!-- Formulaire -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Nom complet -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom complet</mat-label>
          <input 
            matInput
            type="text"
            formControlName="fullName"
            [autocomplete]="formService.getAutoCompleteAttribute('fullName')"
            placeholder="Jean Dupont"
            required>
          <mat-icon matSuffix>person</mat-icon>
          <mat-error *ngIf="formService.shouldShowFieldError(registerForm, 'fullName')">
            {{ formService.getFieldError(registerForm, 'fullName') }}
          </mat-error>
        </mat-form-field>

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
          <mat-error *ngIf="formService.shouldShowFieldError(registerForm, 'email')">
            {{ formService.getFieldError(registerForm, 'email') }}
          </mat-error>
          <mat-hint *ngIf="!formService.shouldShowFieldError(registerForm, 'email')">
            Nous ne partagerons jamais votre email
          </mat-hint>
        </mat-form-field>

        <!-- Mot de passe -->
        <div class="password-field-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input 
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              [autocomplete]="formService.getAutoCompleteAttribute('password')"
              placeholder="Choisissez un mot de passe sécurisé"
              (input)="onPasswordChange()"
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
            <mat-error *ngIf="formService.shouldShowFieldError(registerForm, 'password')">
              {{ formService.getFieldError(registerForm, 'password') }}
            </mat-error>
          </mat-form-field>

          <!-- Indicateur de force du mot de passe -->
          <div class="password-strength" *ngIf="passwordValue() && !formService.shouldShowFieldError(registerForm, 'password')">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                [style.width.%]="passwordStrength().score"
                [style.background-color]="passwordStrength().color">
              </div>
            </div>
            <span class="strength-label" [style.color]="passwordStrength().color">
              {{ passwordStrength().label }}
            </span>
          </div>
        </div>

        <!-- Confirmation mot de passe -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmer le mot de passe</mat-label>
          <input 
            matInput
            [type]="hideConfirmPassword() ? 'password' : 'text'"
            formControlName="confirmPassword"
            [autocomplete]="formService.getAutoCompleteAttribute('confirmPassword')"
            placeholder="Retapez votre mot de passe"
            required>
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="toggleConfirmPasswordVisibility()"
            [attr.aria-label]="'Hide password'"
            [attr.aria-pressed]="hideConfirmPassword()">
            <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="formService.shouldShowFieldError(registerForm, 'confirmPassword')">
            {{ formService.getFieldError(registerForm, 'confirmPassword') }}
          </mat-error>
        </mat-form-field>

        <!-- Conditions d'utilisation -->
        <div class="terms-section">
          <mat-checkbox formControlName="acceptTerms" class="accept-terms">
            J'accepte les 
            <a href="/terms" target="_blank" class="terms-link">conditions d'utilisation</a>
            et la 
            <a href="/privacy" target="_blank" class="terms-link">politique de confidentialité</a>
          </mat-checkbox>
          <mat-error *ngIf="formService.shouldShowFieldError(registerForm, 'acceptTerms')" class="terms-error">
            Vous devez accepter les conditions d'utilisation
          </mat-error>
        </div>

        <!-- Submit Button -->
        <button 
          mat-raised-button 
          color="primary"
          type="submit"
          class="submit-button full-width"
          [disabled]="!formService.canSubmit(registerForm)"
          [class.loading]="isLoading()">
          
          <span *ngIf="!isLoading()">Créer mon compte</span>
          <span *ngIf="isLoading()" class="loading-content">
            <mat-spinner diameter="20"></mat-spinner>
            Création en cours...
          </span>
        </button>

        <!-- Plan Info -->
        <div class="plan-info">
          <div class="plan-card">
            <div class="plan-header">
              <mat-icon class="plan-icon">star</mat-icon>
              <span class="plan-name">Plan Gratuit</span>
            </div>
            <ul class="plan-features">
              <li><mat-icon class="feature-icon">check</mat-icon> 3 projets</li>
              <li><mat-icon class="feature-icon">check</mat-icon> 100 MB de stockage</li>
              <li><mat-icon class="feature-icon">check</mat-icon> Support communauté</li>
              <li><mat-icon class="feature-icon">check</mat-icon> Collaboration basique</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .register-form {
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

    .password-field-container {
      position: relative;
    }

    .password-strength {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--border-color, #e2e8f0);
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: 2px;
    }

    .strength-label {
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 60px;
      text-align: right;
    }

    .terms-section {
      margin: -0.5rem 0;
    }

    .accept-terms {
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .terms-link {
      color: var(--primary-color, #667eea);
      text-decoration: none;
      font-weight: 500;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    .terms-error {
      font-size: 0.75rem;
      color: var(--error-color, #f44336);
      margin-top: 0.5rem;
      display: block;
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

    .plan-info {
      margin-top: 1rem;
    }

    .plan-card {
      background: rgba(102, 126, 234, 0.05);
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }

    .plan-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .plan-icon {
      color: var(--primary-color, #667eea);
      font-size: 1.25rem;
    }

    .plan-name {
      font-weight: 600;
      color: var(--text-primary, #1a1a1a);
      font-size: 1.1rem;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    .feature-icon {
      color: var(--success-color, #4caf50);
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    /* Dark theme */
    :host-context(.dark-theme) .plan-card {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.3);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .register-form {
        padding: 1rem 0;
      }
      
      .plan-features {
        align-items: flex-start;
        text-align: left;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  public registerForm!: FormGroup;
  public hidePassword = signal<boolean>(true);
  public hideConfirmPassword = signal<boolean>(true);
  public isLoading = signal<boolean>(false);
  public passwordValue = signal<string>('');

  // Computed pour la force du mot de passe
  public passwordStrength = computed(() => {
    return this.formService.getPasswordStrength(this.passwordValue());
  });

  constructor(
    public formService: AuthFormService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formService.createRegisterForm({
      showPasswordStrength: true,
      enableAsyncValidation: true,
      autoComplete: true
    });

    // Reset form service state
    this.formService.resetSubmissionState();
  }

  onSubmit(): void {
    if (!this.formService.validateAllFields(this.registerForm)) {
      this.notificationService.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.isLoading.set(true);
    this.formService.setSubmitting(true);

    const registerData = this.formService.getRegisterData(this.registerForm);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.notificationService.success(
          `Bienvenue ${response.user.name} ! Votre compte a été créé avec succès.`
        );
        this.router.navigate(['/workspace']);
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        
        let errorMessage = 'Erreur lors de la création du compte';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides. Vérifiez vos informations.';
        }
        
        this.notificationService.authError(errorMessage);
        this.isLoading.set(false);
        this.formService.setSubmitting(false);
      }
    });
  }

  onPasswordChange(): void {
    const passwordControl = this.registerForm.get('password');
    this.passwordValue.set(passwordControl?.value || '');
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }
}