import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// ===== USER SELECTORS =====
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectUserName = createSelector(
  selectCurrentUser,
  (user) => user?.name || null
);

export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email || null
);

export const selectUserPlan = createSelector(
  selectCurrentUser,
  (user) => user?.plan || 'free'
);

export const selectUserAvatar = createSelector(
  selectCurrentUser,
  (user) => user?.avatar || null
);

export const selectUserPreferences = createSelector(
  selectCurrentUser,
  (user) => user?.preferences || null
);

export const selectUserStats = createSelector(
  selectCurrentUser,
  (user) => user?.stats || null
);

// ===== TOKEN SELECTORS =====
export const selectAccessToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.accessToken
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken
);

export const selectTokenExpiry = createSelector(
  selectAuthState,
  (state: AuthState) => state.tokenExpiry
);

export const selectIsTokenExpired = createSelector(
  selectTokenExpiry,
  (expiry) => {
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  }
);

export const selectTokenTimeRemaining = createSelector(
  selectTokenExpiry,
  (expiry) => {
    if (!expiry) return 0;
    const remaining = new Date(expiry).getTime() - Date.now();
    return Math.max(0, remaining);
  }
);

// ===== LOADING SELECTORS =====
export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectIsLoginLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoginLoading
);

export const selectIsRegisterLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isRegisterLoading
);

export const selectIsProfileUpdateLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isProfileUpdateLoading
);

export const selectIsPasswordResetLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isPasswordResetLoading
);

export const selectIsAnyLoading = createSelector(
  selectAuthState,
  (state: AuthState) => 
    state.isLoading || 
    state.isLoginLoading || 
    state.isRegisterLoading || 
    state.isProfileUpdateLoading || 
    state.isPasswordResetLoading
);

// ===== ERROR SELECTORS =====
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectLoginError = createSelector(
  selectAuthState,
  (state: AuthState) => state.loginError
);

export const selectRegisterError = createSelector(
  selectAuthState,
  (state: AuthState) => state.registerError
);

export const selectProfileError = createSelector(
  selectAuthState,
  (state: AuthState) => state.profileError
);

export const selectPasswordError = createSelector(
  selectAuthState,
  (state: AuthState) => state.passwordError
);

export const selectHasAnyError = createSelector(
  selectAuthState,
  (state: AuthState) => 
    !!state.error || 
    !!state.loginError || 
    !!state.registerError || 
    !!state.profileError || 
    !!state.passwordError
);

// ===== SESSION SELECTORS =====
export const selectLastActivity = createSelector(
  selectAuthState,
  (state: AuthState) => state.lastActivity
);

export const selectSessionStartTime = createSelector(
  selectAuthState,
  (state: AuthState) => state.sessionStartTime
);

export const selectIsSessionExpired = createSelector(
  selectAuthState,
  (state: AuthState) => state.isSessionExpired
);

export const selectSessionDuration = createSelector(
  selectSessionStartTime,
  (startTime) => {
    if (!startTime) return 0;
    return Date.now() - new Date(startTime).getTime();
  }
);

export const selectTimeSinceLastActivity = createSelector(
  selectLastActivity,
  (lastActivity) => {
    if (!lastActivity) return 0;
    return Date.now() - new Date(lastActivity).getTime();
  }
);

// ===== TWO-FACTOR SELECTORS =====
export const selectRequiresTwoFactor = createSelector(
  selectAuthState,
  (state: AuthState) => state.requiresTwoFactor
);

export const selectTwoFactorToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.twoFactorToken
);

// ===== REMEMBER ME SELECTOR =====
export const selectRememberMe = createSelector(
  selectAuthState,
  (state: AuthState) => state.rememberMe
);

// ===== COMPOUND SELECTORS =====
export const selectUserProfile = createSelector(
  selectCurrentUser,
  selectIsAuthenticated,
  (user, isAuthenticated) => ({
    user,
    isAuthenticated,
    isLoaded: !!user && isAuthenticated
  })
);

export const selectAuthStatus = createSelector(
  selectIsAuthenticated,
  selectIsAnyLoading,
  selectHasAnyError,
  selectIsSessionExpired,
  (isAuthenticated, isLoading, hasError, isSessionExpired) => ({
    isAuthenticated,
    isLoading,
    hasError,
    isSessionExpired,
    canAccess: isAuthenticated && !isSessionExpired && !isLoading
  })
);

export const selectAuthenticationState = createSelector(
  selectAuthState,
  (state: AuthState) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    hasValidToken: !!state.accessToken && !selectIsTokenExpired.projector(state.tokenExpiry),
    sessionExpired: state.isSessionExpired
  })
);

// ===== PERMISSION SELECTORS =====
export const selectHasPlan = (plan: 'free' | 'pro' | 'enterprise') =>
  createSelector(
    selectUserPlan,
    (userPlan) => {
      const planHierarchy = { free: 1, pro: 2, enterprise: 3 };
      return planHierarchy[userPlan] >= planHierarchy[plan];
    }
  );

export const selectCanAccessFeature = (requiredPlan: 'free' | 'pro' | 'enterprise') =>
  createSelector(
    selectIsAuthenticated,
    selectHasPlan(requiredPlan),
    (isAuthenticated, hasPlan) => isAuthenticated && hasPlan
  );

// ===== UTILITY SELECTORS =====
export const selectShouldRefreshToken = createSelector(
  selectIsAuthenticated,
  selectTokenTimeRemaining,
  (isAuthenticated, timeRemaining) => {
    if (!isAuthenticated) return false;
    // Refresh token if less than 5 minutes remaining
    return timeRemaining < 5 * 60 * 1000;
  }
);

export const selectShouldLogoutDueToInactivity = createSelector(
  selectTimeSinceLastActivity,
  (timeSinceActivity) => {
    // Auto-logout after 2 hours of inactivity
    return timeSinceActivity > 2 * 60 * 60 * 1000;
  }
);