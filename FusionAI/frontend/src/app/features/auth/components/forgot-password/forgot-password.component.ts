import { Component, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '@core/services/notification.service';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'auth-forgot-password',
  template: `
    <div class="forgot-password-form">
      <div class="form-header">
        <mat-icon class="form-icon">lock_reset</mat-icon>
        <h2 class="form-title">Mot de passe oublié</h2>
        <p class="form-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse email</mat-label>
          <input 
            matInput
            type="email"
            formControlName="email"
            placeholder="votre@email.com"
            required>
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="formService.shouldShowFieldError(forgotPasswordForm, 'email')">
            {{ formService.getFieldError(forgotPasswordForm, 'email') }}
          </mat-error>
        </mat-form-field>

        <button 
          mat-raised-button 
          color="primary"
          type="submit"
          class="submit-button full-width"
          [disabled]="!formService.canSubmit(forgotPasswordForm)"
          [class.loading]="isLoading()">
          
          <span *ngIf="!isLoading()">Envoyer le lien</span>
          <span *ngIf="isLoading()" class="loading-content">
            <mat-spinner diameter="20"></mat-spinner>
            Envoi en cours...
          </span>
        </button>

        <div class="back-to-login">
          <a routerLink="/auth/login" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Retour à la connexion
          </a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .forgot-password-form {
      padding: 2rem 0;
      max-width: 400px;
      margin: 0 auto;
      text-align: center;
    }

    .form-header {
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
      line-height: 1.4;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
    }

    .loading-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .back-to-login {
      margin-top: 1rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary, #666);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--primary-color, #667eea);
    }

    .back-link mat-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPasswordForm!: FormGroup;
  public isLoading = signal<boolean>(false);

  constructor(
    public formService: AuthFormService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formService.createForgotPasswordForm();
    this.formService.resetSubmissionState();
  }

  onSubmit(): void {
    if (!this.formService.validateAllFields(this.forgotPasswordForm)) {
      return;
    }

    this.isLoading.set(true);
    
    // Simuler l'envoi d'email
    setTimeout(() => {
      this.notificationService.success(
        'Email envoyé ! Vérifiez votre boîte de réception.'
      );
      this.isLoading.set(false);
      this.router.navigate(['/auth/login']);
    }, 2000);
  }
}