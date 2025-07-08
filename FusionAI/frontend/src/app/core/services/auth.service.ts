import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, map, tap, catchError, throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  ApiResponse 
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}${environment.endpoints.auth}`;
  
  // Signals pour l'état d'authentification
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);
  public isLoading = signal<boolean>(false);
  
  // BehaviorSubject pour la compatibilité avec les observables
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialiser l'authentification au démarrage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.setAuthenticatedState(user);
      this.verifyToken().subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.clearAuth();
          }
        },
        error: () => this.clearAuth()
      });
    }
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inscription utilisateur
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): Observable<any> {
    const refreshToken = this.getStoredRefreshToken();
    
    return this.http.post(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/']);
      }),
      catchError(() => {
        // Même en cas d'erreur, on déconnecte localement
        this.clearAuth();
        this.router.navigate(['/']);
        return throwError(() => new Error('Erreur lors de la déconnexion'));
      })
    );
  }

  /**
   * Renouveler le token d'accès
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifier la validité du token
   */
  verifyToken(): Observable<boolean> {
    const token = this.getStoredToken();
    
    if (!token) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http.post<ApiResponse>(`${this.apiUrl}/verify`, { token }).pipe(
      map(response => response.data?.valid || false),
      catchError(() => new Observable(observer => {
        observer.next(false);
        observer.complete();
      }))
    );
  }

  /**
   * Gérer le succès de l'authentification
   */
  private handleAuthSuccess(response: AuthResponse): void {
    const { user, tokens } = response;
    
    // Stocker les tokens
    this.storeTokens(tokens.accessToken, tokens.refreshToken);
    
    // Stocker l'utilisateur
    this.storeUser(user);
    
    // Mettre à jour l'état
    this.setAuthenticatedState(user);
    
    this.isLoading.set(false);
  }

  /**
   * Définir l'état d'authentification
   */
  private setAuthenticatedState(user: User): void {
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.userSubject.next(user);
  }

  /**
   * Effacer l'authentification
   */
  private clearAuth(): void {
    this.clearStoredAuth();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.userSubject.next(null);
    this.isLoading.set(false);
  }

  // === Méthodes de stockage ===

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(environment.storage.tokenKey, accessToken);
    localStorage.setItem(environment.storage.refreshTokenKey, refreshToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem(environment.storage.userKey, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(environment.storage.tokenKey);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(environment.storage.refreshTokenKey);
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(environment.storage.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(environment.storage.tokenKey);
    localStorage.removeItem(environment.storage.refreshTokenKey);
    localStorage.removeItem(environment.storage.userKey);
  }

  // === Méthodes utilitaires publiques ===

  /**
   * Obtenir le token d'accès actuel
   */
  getAccessToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Obtenir l'ID de l'utilisateur actuel
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Vérifier si l'utilisateur a un plan spécifique
   */
  hasActivePlan(plan: 'free' | 'pro' | 'enterprise'): boolean {
    const user = this.getCurrentUser();
    return user ? user.plan === plan : false;
  }
}