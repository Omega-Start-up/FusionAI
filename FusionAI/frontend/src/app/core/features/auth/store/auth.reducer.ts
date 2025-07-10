import { createReducer, on } from '@ngrx/store';
import { User } from '@models/index';
import * as AuthActions from './auth.actions';

export interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  
  // Loading states
  isLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isProfileUpdateLoading: boolean;
  isPasswordResetLoading: boolean;
  
  // Error states
  error: string | null;
  loginError: string | null;
  registerError: string | null;
  profileError: string | null;
  passwordError: string | null;
  
  // Session info
  lastActivity: Date | null;
  sessionStartTime: Date | null;
  isSessionExpired: boolean;
  
  // Remember me
  rememberMe: boolean;
  
  // Two-factor authentication
  requiresTwoFactor: boolean;
  twoFactorToken: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  
  isLoading: false,
  isLoginLoading: false,
  isRegisterLoading: false,
  isProfileUpdateLoading: false,
  isPasswordResetLoading: false,
  
  error: null,
  loginError: null,
  registerError: null,
  profileError: null,
  passwordError: null,
  
  lastActivity: null,
  sessionStartTime: null,
  isSessionExpired: false,
  
  rememberMe: false,
  
  requiresTwoFactor: false,
  twoFactorToken: null
};

export const authReducer = createReducer(
  initialState,

  // ===== LOGIN =====
  on(AuthActions.login, (state, { credentials }) => ({
    ...state,
    isLoginLoading: true,
    loginError: null,
    error: null,
    rememberMe: (credentials as any).rememberMe || false
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    tokenExpiry: new Date(Date.now() + parseInt(response.tokens.expiresIn) * 1000),
    isLoginLoading: false,
    isLoading: false,
    loginError: null,
    error: null,
    sessionStartTime: new Date(),
    lastActivity: new Date(),
    isSessionExpired: false
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoginLoading: false,
    isLoading: false,
    loginError: error,
    error: error,
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null
  })),

  // ===== REGISTER =====
  on(AuthActions.register, (state) => ({
    ...state,
    isRegisterLoading: true,
    registerError: null,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    tokenExpiry: new Date(Date.now() + parseInt(response.tokens.expiresIn) * 1000),
    isRegisterLoading: false,
    isLoading: false,
    registerError: null,
    error: null,
    sessionStartTime: new Date(),
    lastActivity: new Date(),
    isSessionExpired: false
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isRegisterLoading: false,
    isLoading: false,
    registerError: error,
    error: error
  })),

  // ===== TOKEN REFRESH =====
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    tokenExpiry: new Date(Date.now() + parseInt(response.tokens.expiresIn) * 1000),
    isLoading: false,
    error: null,
    isSessionExpired: false,
    lastActivity: new Date()
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isSessionExpired: true
  })),

  // ===== TOKEN VERIFICATION =====
  on(AuthActions.verifyToken, (state) => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.verifyTokenSuccess, (state, { isValid }) => ({
    ...state,
    isLoading: false,
    isAuthenticated: isValid,
    isSessionExpired: !isValid,
    lastActivity: isValid ? new Date() : state.lastActivity
  })),

  on(AuthActions.verifyTokenFailure, (state) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isSessionExpired: true
  })),

  // ===== LOGOUT =====
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...initialState,
    rememberMe: false
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...initialState,
    error: error
  })),

  // ===== PROFILE UPDATE =====
  on(AuthActions.updateProfile, (state) => ({
    ...state,
    isProfileUpdateLoading: true,
    profileError: null,
    error: null
  })),

  on(AuthActions.updateProfileSuccess, (state, { user }) => ({
    ...state,
    user: user,
    isProfileUpdateLoading: false,
    profileError: null,
    error: null,
    lastActivity: new Date()
  })),

  on(AuthActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    isProfileUpdateLoading: false,
    profileError: error,
    error: error
  })),

  // ===== PASSWORD RESET =====
  on(AuthActions.forgotPassword, (state) => ({
    ...state,
    isPasswordResetLoading: true,
    passwordError: null,
    error: null
  })),

  on(AuthActions.forgotPasswordSuccess, (state) => ({
    ...state,
    isPasswordResetLoading: false,
    passwordError: null,
    error: null
  })),

  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    isPasswordResetLoading: false,
    passwordError: error,
    error: error
  })),

  on(AuthActions.resetPassword, (state) => ({
    ...state,
    isPasswordResetLoading: true,
    passwordError: null,
    error: null
  })),

  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state,
    isPasswordResetLoading: false,
    passwordError: null,
    error: null
  })),

  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    isPasswordResetLoading: false,
    passwordError: error,
    error: error
  })),

  // ===== STATE RESTORATION =====
  on(AuthActions.restoreAuthState, (state, { user, tokens }) => ({
    ...state,
    user: user,
    isAuthenticated: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    isLoading: false,
    error: null,
    sessionStartTime: new Date(),
    lastActivity: new Date(),
    isSessionExpired: false
  })),

  // ===== UI ACTIONS =====
  on(AuthActions.setLoading, (state, { loading }) => ({
    ...state,
    isLoading: loading
  })),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
    loginError: null,
    registerError: null,
    profileError: null,
    passwordError: null
  })),

  on(AuthActions.setError, (state, { error }) => ({
    ...state,
    error: error,
    isLoading: false
  })),

  // ===== SESSION MANAGEMENT =====
  on(AuthActions.sessionExpired, (state) => ({
    ...state,
    isSessionExpired: true,
    isAuthenticated: false
  })),

  on(AuthActions.sessionRefreshed, (state) => ({
    ...state,
    isSessionExpired: false,
    lastActivity: new Date()
  })),

  on(AuthActions.updateLastActivity, (state) => ({
    ...state,
    lastActivity: new Date()
  }))
);