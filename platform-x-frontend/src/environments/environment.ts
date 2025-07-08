export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Platform X',
  version: '1.0.0',
  features: {
    enableRealTimeCollaboration: true,
    enableFileSharing: true,
    enableGithubIntegration: true,
    enableTeamFeatures: true,
    enableAnalytics: false
  },
  urls: {
    frontend: 'http://localhost:4200',
    backend: 'http://localhost:3000',
    websocket: 'ws://localhost:3000'
  },
  auth: {
    tokenKey: 'platform_x_token',
    refreshTokenKey: 'platform_x_refresh_token',
    userKey: 'platform_x_user'
  },
  storage: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.md']
  }
};