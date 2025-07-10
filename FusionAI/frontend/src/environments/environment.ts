export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3001',
  appName: 'FusionAI',
  version: '1.0.0',
  debug: true,
  features: {
    analytics: false,
    errorReporting: false,
    offlineMode: true,
    realTimeUpdates: true,
    darkMode: true,
    notifications: true
  },
  endpoints: {
    auth: '/auth',
    users: '/users',
    projects: '/projects',
    windows: '/windows',
    files: '/files'
  },
  storage: {
    tokenKey: 'fusionai_token',
    refreshTokenKey: 'fusionai_refresh_token',
    userKey: 'fusionai_user',
    preferencesKey: 'fusionai_preferences'
  },
  ui: {
    defaultTheme: 'dark',
    animations: true,
    sidebar: {
      defaultCollapsed: false,
      collapsible: true
    },
    windows: {
      defaultWidth: 800,
      defaultHeight: 600,
      minWidth: 300,
      minHeight: 200,
      maxWindows: 10
    }
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 5,
    maxProjectNameLength: 100,
    maxDescriptionLength: 500
  },
  
  // PWA Configuration
  vapidPublicKey: 'your-vapid-public-key-here'
};