import { createReducer, on } from '@ngrx/store';

export interface UIState {
  // Theme
  isDarkMode: boolean;
  primaryColor: string;
  accentColor: string;
  
  // Layout
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  headerVisible: boolean;
  footerVisible: boolean;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  activeModal: string | null;
  modalData: any;
  
  // Toasts
  toasts: Toast[];
  
  // Preferences
  fontSize: number;
  language: string;
  autoSave: boolean;
  showWelcome: boolean;
  
  // Performance
  enableAnimations: boolean;
  reducedMotion: boolean;
  
  // Accessibility
  highContrast: boolean;
  screenReader: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration: number;
  timestamp: Date;
  visible: boolean;
}

export const initialState: UIState = {
  isDarkMode: false,
  primaryColor: '#6366f1',
  accentColor: '#ec4899',
  
  sidebarCollapsed: false,
  sidebarWidth: 280,
  headerVisible: true,
  footerVisible: true,
  
  globalLoading: false,
  loadingMessage: null,
  
  notifications: [],
  
  activeModal: null,
  modalData: null,
  
  toasts: [],
  
  fontSize: 14,
  language: 'fr',
  autoSave: true,
  showWelcome: true,
  
  enableAnimations: true,
  reducedMotion: false,
  
  highContrast: false,
  screenReader: false
};

export const uiReducer = createReducer(
  initialState,
  // Actions would be defined here
);