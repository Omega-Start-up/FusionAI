import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '@environments/environment';

// États des features
import { AuthState, authReducer } from '../features/auth/store/auth.reducer';
import { ProjectState, projectReducer } from '../features/projects/store/project.reducer';
import { WindowState, windowReducer } from '../features/windows/store/window.reducer';
import { UIState, uiReducer } from './ui/ui.reducer';

/**
 * Interface de l'état global de l'application
 */
export interface AppState {
  auth: AuthState;
  projects: ProjectState;
  windows: WindowState;
  ui: UIState;
}

/**
 * Reducers de l'application
 */
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  projects: projectReducer,
  windows: windowReducer,
  ui: uiReducer
};

/**
 * Meta-reducers pour logging et développement
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production 
  ? [] 
  : [];

/**
 * Clés pour le local storage
 */
export const STORAGE_KEYS = {
  AUTH_STATE: 'fusionai_auth_state',
  UI_PREFERENCES: 'fusionai_ui_preferences',
  WINDOW_LAYOUT: 'fusionai_window_layout'
};

/**
 * État initial hydraté depuis le localStorage
 */
export function getInitialState(): Partial<AppState> {
  try {
    const authState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    const uiPreferences = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
    
    return {
      auth: authState ? JSON.parse(authState) : undefined,
      ui: uiPreferences ? JSON.parse(uiPreferences) : undefined
    };
  } catch (error) {
    console.warn('Erreur lors de la récupération de l\'état depuis localStorage:', error);
    return {};
  }
}

/**
 * Sauvegarder l'état dans le localStorage
 */
export function saveStateToStorage(state: Partial<AppState>): void {
  try {
    if (state.auth) {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(state.auth));
    }
    if (state.ui) {
      localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(state.ui));
    }
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de l\'état:', error);
  }
}