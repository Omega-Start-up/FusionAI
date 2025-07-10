import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

@Injectable()
export class AuthValidationService {
  private readonly apiUrl = `${environment.apiUrl}${environment.endpoints.auth}`;

  constructor(private http: HttpClient) {}

  // === VALIDATEURS SYNCHRONES ===

  /**
   * Validateur d'email
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);
      
      return isValid ? null : { 
        email: { 
          message: 'Veuillez entrer une adresse email valide' 
        } 
      };
    };
  }

  /**
   * Validateur de mot de passe fort
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const password = control.value;
      const errors: any = {};
      
      // Longueur minimale
      if (password.length < 8) {
        errors.minLength = 'Au moins 8 caractères requis';
      }
      
      // Majuscule
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = 'Au moins une lettre majuscule requise';
      }
      
      // Minuscule
      if (!/[a-z]/.test(password)) {
        errors.lowercase = 'Au moins une lettre minuscule requise';
      }
      
      // Chiffre
      if (!/\d/.test(password)) {
        errors.number = 'Au moins un chiffre requis';
      }
      
      // Caractère spécial
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.special = 'Au moins un caractère spécial requis';
      }
      
      return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
    };
  }

  /**
   * Validateur de confirmation de mot de passe
   */
  static passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');
      
      if (!password || !confirmPassword) return null;
      
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ 
          passwordMismatch: { 
            message: 'Les mots de passe ne correspondent pas' 
          } 
        });
        return { passwordMismatch: true };
      }
      
      // Supprimer l'erreur si les mots de passe correspondent
      if (confirmPassword.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      
      return null;
    };
  }

  /**
   * Validateur de nom d'utilisateur
   */
  static usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const username = control.value;
      const errors: any = {};
      
      // Longueur
      if (username.length < 3) {
        errors.minLength = 'Au moins 3 caractères requis';
      }
      
      if (username.length > 20) {
        errors.maxLength = 'Maximum 20 caractères autorisés';
      }
      
      // Caractères autorisés
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.invalidChars = 'Seuls les lettres, chiffres, tirets et underscores sont autorisés';
      }
      
      // Ne peut pas commencer par un chiffre
      if (/^\d/.test(username)) {
        errors.startsWithNumber = 'Ne peut pas commencer par un chiffre';
      }
      
      return Object.keys(errors).length > 0 ? { username: errors } : null;
    };
  }

  /**
   * Validateur de nom complet
   */
  static fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const name = control.value.trim();
      
      if (name.length < 2) {
        return { 
          fullName: { 
            message: 'Au moins 2 caractères requis' 
          } 
        };
      }
      
      // Vérifier qu'il y a au moins un prénom et un nom
      const parts = name.split(' ').filter((part: string) => part.length > 0);
      if (parts.length < 2) {
        return { 
          fullName: { 
            message: 'Prénom et nom requis' 
          } 
        };
      }
      
      return null;
    };
  }

  // === VALIDATEURS ASYNCHRONES ===

  /**
   * Vérifier si l'email existe déjà
   */
  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      
      return timer(500).pipe( // Debounce de 500ms
        switchMap(() => 
          this.http.post<{exists: boolean}>(`${this.apiUrl}/check-email`, {
            email: control.value
          }).pipe(
            map(response => {
              return response.exists ? { 
                emailExists: { 
                  message: 'Cette adresse email est déjà utilisée' 
                } 
              } : null;
            }),
            catchError(() => of(null)) // En cas d'erreur, pas de validation
          )
        )
      );
    };
  }

  /**
   * Vérifier si le nom d'utilisateur existe déjà
   */
  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      
      return timer(500).pipe( // Debounce de 500ms
        switchMap(() => 
          this.http.post<{exists: boolean}>(`${this.apiUrl}/check-username`, {
            username: control.value
          }).pipe(
            map(response => {
              return response.exists ? { 
                usernameExists: { 
                  message: 'Ce nom d\'utilisateur est déjà pris' 
                } 
              } : null;
            }),
            catchError(() => of(null)) // En cas d'erreur, pas de validation
          )
        )
      );
    };
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Obtenir le premier message d'erreur d'un contrôle
   */
  getFirstErrorMessage(control: AbstractControl): string | null {
    if (!control.errors) return null;
    
    const firstError = Object.keys(control.errors)[0];
    const error = control.errors[firstError];
    
    // Si l'erreur a un message personnalisé
    if (error && typeof error === 'object' && error.message) {
      return error.message;
    }
    
    // Messages d'erreur par défaut
    const defaultMessages: { [key: string]: string } = {
      required: 'Ce champ est requis',
      email: 'Adresse email invalide',
      minlength: `Au moins ${error.requiredLength} caractères requis`,
      maxlength: `Maximum ${error.requiredLength} caractères autorisés`,
      pattern: 'Format invalide'
    };
    
    return defaultMessages[firstError] || 'Valeur invalide';
  }

  /**
   * Obtenir tous les messages d'erreur d'un contrôle
   */
  getAllErrorMessages(control: AbstractControl): string[] {
    if (!control.errors) return [];
    
    return Object.keys(control.errors).map(key => {
      const error = control.errors![key];
      
      if (error && typeof error === 'object' && error.message) {
        return error.message;
      }
      
      return this.getFirstErrorMessage(control) || 'Erreur inconnue';
    });
  }

  /**
   * Vérifier la force du mot de passe (0-100)
   */
  getPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let score = 0;
    
    // Longueur
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Variété de caractères
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Obtenir le label de force du mot de passe
   */
  getPasswordStrengthLabel(strength: number): string {
    if (strength < 40) return 'Faible';
    if (strength < 70) return 'Moyen';
    if (strength < 90) return 'Fort';
    return 'Très fort';
  }

  /**
   * Obtenir la couleur de la force du mot de passe
   */
  getPasswordStrengthColor(strength: number): string {
    if (strength < 40) return '#f44336'; // Rouge
    if (strength < 70) return '#ff9800'; // Orange
    if (strength < 90) return '#4caf50'; // Vert
    return '#2196f3'; // Bleu
  }
}