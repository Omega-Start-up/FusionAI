import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthValidationService } from './auth-validation.service';
import { LoginCredentials, RegisterData } from '@models/index';

export interface AuthFormConfig {
  showPasswordStrength?: boolean;
  enableAsyncValidation?: boolean;
  autoComplete?: boolean;
}

@Injectable()
export class AuthFormService {
  // Signals pour l'état des formulaires
  public isSubmitting = signal<boolean>(false);
  public submitAttempted = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private validationService: AuthValidationService
  ) {}

  /**
   * Créer le formulaire de connexion
   */
  createLoginForm(config: AuthFormConfig = {}): FormGroup {
    return this.fb.group({
      email: ['', [
        Validators.required,
        AuthValidationService.emailValidator()
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Créer le formulaire d'inscription
   */
  createRegisterForm(config: AuthFormConfig = {}): FormGroup {
    const form = this.fb.group({
      fullName: ['', [
        Validators.required,
        AuthValidationService.fullNameValidator()
      ]],
      email: ['', [
        Validators.required,
        AuthValidationService.emailValidator()
      ]],
      password: ['', [
        Validators.required,
        AuthValidationService.strongPasswordValidator()
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      acceptTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: [AuthValidationService.passwordMatchValidator()]
    });

    // Ajouter la validation asynchrone si activée
    if (config.enableAsyncValidation) {
      form.get('email')?.setAsyncValidators([
        this.validationService.emailExistsValidator()
      ]);
    }

    return form;
  }

  /**
   * Créer le formulaire de mot de passe oublié
   */
  createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [
        Validators.required,
        AuthValidationService.emailValidator()
      ]]
    });
  }

  /**
   * Créer le formulaire de réinitialisation de mot de passe
   */
  createResetPasswordForm(): FormGroup {
    return this.fb.group({
      password: ['', [
        Validators.required,
        AuthValidationService.strongPasswordValidator()
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      token: ['', [
        Validators.required
      ]]
    }, {
      validators: [AuthValidationService.passwordMatchValidator()]
    });
  }

  /**
   * Convertir FormGroup vers LoginCredentials
   */
  getLoginCredentials(form: FormGroup): LoginCredentials {
    return {
      email: form.get('email')?.value,
      password: form.get('password')?.value
    };
  }

  /**
   * Convertir FormGroup vers RegisterData
   */
  getRegisterData(form: FormGroup): RegisterData {
    return {
      name: form.get('fullName')?.value,
      email: form.get('email')?.value,
      password: form.get('password')?.value,
      plan: 'free'
    };
  }

  /**
   * Valider tout le formulaire et marquer les champs touchés
   */
  validateAllFields(form: FormGroup): boolean {
    this.submitAttempted.set(true);
    
    // Marquer tous les champs comme touchés
    this.markFormGroupTouched(form);
    
    return form.valid;
  }

  /**
   * Marquer récursivement tous les champs d'un FormGroup comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Réinitialiser l'état de soumission
   */
  resetSubmissionState(): void {
    this.isSubmitting.set(false);
    this.submitAttempted.set(false);
  }

  /**
   * Définir l'état de soumission
   */
  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
  }

  /**
   * Vérifier si un champ doit afficher son erreur
   */
  shouldShowFieldError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitAttempted()));
  }

  /**
   * Obtenir le message d'erreur d'un champ
   */
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    if (!field || !this.shouldShowFieldError(form, fieldName)) {
      return null;
    }
    
    return this.validationService.getFirstErrorMessage(field);
  }

  /**
   * Vérifier si le formulaire peut être soumis
   */
  canSubmit(form: FormGroup): boolean {
    return form.valid && !this.isSubmitting();
  }

  /**
   * Obtenir la configuration de saisie automatique pour un champ
   */
  getAutoCompleteAttribute(fieldName: string): string {
    const autoCompleteMap: { [key: string]: string } = {
      email: 'email',
      password: 'current-password',
      confirmPassword: 'new-password',
      fullName: 'name',
      firstName: 'given-name',
      lastName: 'family-name'
    };
    
    return autoCompleteMap[fieldName] || 'off';
  }

  /**
   * Obtenir la force du mot de passe
   */
  getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    const score = this.validationService.getPasswordStrength(password);
    return {
      score,
      label: this.validationService.getPasswordStrengthLabel(score),
      color: this.validationService.getPasswordStrengthColor(score)
    };
  }

  /**
   * Génération de mots de passe sécurisés (utilitaire)
   */
  generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Garantir au moins un caractère de chaque type
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Remplir le reste
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}