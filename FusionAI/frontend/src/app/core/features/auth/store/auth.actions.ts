import { createAction, props } from '@ngrx/store';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@models/index';

// ===== LOGIN ACTIONS =====
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// ===== REGISTER ACTIONS =====
export const register = createAction(
  '[Auth] Register',
  props<{ data: RegisterData }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: AuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// ===== TOKEN ACTIONS =====
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ response: AuthResponse }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

export const verifyToken = createAction('[Auth] Verify Token');

export const verifyTokenSuccess = createAction(
  '[Auth] Verify Token Success',
  props<{ isValid: boolean }>()
);

export const verifyTokenFailure = createAction(
  '[Auth] Verify Token Failure'
);

// ===== LOGOUT ACTIONS =====
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// ===== USER PROFILE ACTIONS =====
export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ userData: Partial<User> }>()
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: User }>()
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: string }>()
);

// ===== INITIALIZATION ACTIONS =====
export const initializeAuth = createAction('[Auth] Initialize');

export const restoreAuthState = createAction(
  '[Auth] Restore State',
  props<{ user: User; tokens: { accessToken: string; refreshToken: string } }>()
);

// ===== PASSWORD ACTIONS =====
export const forgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ email: string }>()
);

export const forgotPasswordSuccess = createAction(
  '[Auth] Forgot Password Success'
);

export const forgotPasswordFailure = createAction(
  '[Auth] Forgot Password Failure',
  props<{ error: string }>()
);

export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ token: string; password: string }>()
);

export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success'
);

export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: string }>()
);

// ===== UI STATE ACTIONS =====
export const setLoading = createAction(
  '[Auth] Set Loading',
  props<{ loading: boolean }>()
);

export const clearError = createAction('[Auth] Clear Error');

export const setError = createAction(
  '[Auth] Set Error',
  props<{ error: string }>()
);

// ===== SESSION ACTIONS =====
export const sessionExpired = createAction('[Auth] Session Expired');

export const sessionRefreshed = createAction('[Auth] Session Refreshed');

export const updateLastActivity = createAction('[Auth] Update Last Activity');