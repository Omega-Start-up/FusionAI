import { Component, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '@core/services/notification.service';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'auth-reset-password',
  template: `
    <div class="reset-password-form">
      <div class="form-header">
        <mat-icon class="form-icon">security</mat-icon>
        <h2 class="form-title">Nouveau mot de passe</h2>
        <p class="form-subtitle">Définissez votre nouveau mot de passe sécurisé</p>
      </div>

      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nouveau mot de passe</mat-label>
          <input 
            matInput
            [type]="hidePassword() ? 'password' : 'text'"
            formControlName="password"
            placeholder="Choisissez un mot de passe sécurisé"
            required>
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="togglePasswordVisibility()">
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="formService.shouldShowFieldError(resetPasswordForm, 'password')">
            {{ formService.getFieldError(resetPasswordForm, 'password') }}
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmer le mot de passe</mat-label>
          <input 
            matInput
            [type]="hideConfirmPassword() ? 'password' : 'text'"
            formControlName="confirmPassword"
            placeholder="Retapez votre mot de passe"
            required>
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="toggleConfirmPasswordVisibility()">
            <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="formService.shouldShowFieldError(resetPasswordForm, 'confirmPassword')">
            {{ formService.getFieldError(resetPasswordForm, 'confirmPassword') }}
          </mat-error>
        </mat-form-field>

        <button 
          mat-raised-button 
          color="primary"
          type="submit"
          class="submit-button full-width"
          [disabled]="!formService.canSubmit(resetPasswordForm)"
          [class.loading]="isLoading()">
          
          <span *ngIf="!isLoading()">Réinitialiser</span>
          <span *ngIf="isLoading()" class="loading-content">
            <mat-spinner diameter="20"></mat-spinner>
            Mise à jour...
          </span>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .reset-password-form {
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
      color: var(--success-color, #4caf50);
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
  `]
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm!: FormGroup;
  public hidePassword = signal<boolean>(true);
  public hideConfirmPassword = signal<boolean>(true);
  public isLoading = signal<boolean>(false);

  constructor(
    public formService: AuthFormService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetPasswordForm = this.formService.createResetPasswordForm();
    
    // Récupérer le token depuis l'URL
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.resetPasswordForm.patchValue({ token });
    }
    
    this.formService.resetSubmissionState();
  }

  onSubmit(): void {
    if (!this.formService.validateAllFields(this.resetPasswordForm)) {
      return;
    }

    this.isLoading.set(true);
    
    // Simuler la réinitialisation
    setTimeout(() => {
      this.notificationService.success(
        'Mot de passe mis à jour avec succès !'
      );
      this.isLoading.set(false);
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }
}