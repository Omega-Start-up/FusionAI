export interface AppWindow {
  id: string;
  title: string;
  component: string;
  position: WindowPosition;
  size: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  isVisible: boolean;
  zIndex: number;
  data?: any;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export enum WindowType {
  CODE_EDITOR = 'code-editor',
  GITHUB_BROWSER = 'github-browser',
  DATABASE_VIEWER = 'database-viewer',
  PROJECT_MANAGER = 'project-manager',
  SETTINGS = 'settings',
  TEAM_INVITE = 'team-invite'
}