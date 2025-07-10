import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, tap, withLatestFrom, filter, delay } from 'rxjs/operators';
import { of, timer } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import * as AuthActions from './auth.actions';
import * as AuthSelectors from './auth.selectors';
import { AppState, saveStateToStorage } from '../../../store/app.state';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store<AppState>);

  // ===== LOGIN EFFECTS =====
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Erreur de connexion';
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ response }) => {
        console.log('Connexion réussie !');
        this.router.navigate(['/workspace']);
      })
    ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        console.error('Erreur de connexion:', error);
      })
    ),
    { dispatch: false }
  );

  // ===== REGISTER EFFECTS =====
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ data }) =>
        this.authService.register(data).pipe(
          map(response => AuthActions.registerSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Erreur lors de l\'inscription';
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => {
        console.log('Inscription réussie !');
        this.router.navigate(['/workspace']);
      })
    ),
    { dispatch: false }
  );

  // ===== LOGOUT EFFECTS =====
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Erreur lors de la déconnexion';
            return of(AuthActions.logoutFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        console.log('Déconnexion réussie');
        this.router.navigate(['/auth/login']);
        localStorage.clear();
      })
    ),
    { dispatch: false }
  );

  // ===== TOKEN REFRESH EFFECTS =====
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      withLatestFrom(this.store.select(AuthSelectors.selectRefreshToken)),
      switchMap(([action, refreshToken]) => {
        if (!refreshToken) {
          return of(AuthActions.refreshTokenFailure({ error: 'No refresh token available' }));
        }
        
        return this.authService.refreshToken().pipe(
          map(response => AuthActions.refreshTokenSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Token refresh failed';
            return of(AuthActions.refreshTokenFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  refreshTokenFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenFailure),
      tap(() => {
        console.warn('Session expirée');
        this.router.navigate(['/auth/login']);
        localStorage.clear();
      })
    ),
    { dispatch: false }
  );

  // ===== INITIALIZATION EFFECTS =====
  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      switchMap(() => {
        const storedState = localStorage.getItem('fusionai_auth_state');
        if (storedState) {
          try {
            const authState = JSON.parse(storedState);
            if (authState.user && authState.accessToken) {
              return this.authService.verifyToken().pipe(
                map(() => AuthActions.restoreAuthState({
                  user: authState.user,
                  tokens: {
                    accessToken: authState.accessToken,
                    refreshToken: authState.refreshToken
                  }
                })),
                catchError(() => of(AuthActions.verifyTokenFailure()))
              );
            }
          } catch (error) {
            console.warn('Failed to parse stored auth state:', error);
          }
        }
        return of(AuthActions.verifyTokenFailure());
      })
    )
  );
}