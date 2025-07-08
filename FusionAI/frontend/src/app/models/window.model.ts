export interface AppWindow {
  id: number;
  userId: number;
  title: string;
  type: WindowType;
  projectId?: number;
  state: WindowState;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive: boolean;
  content: WindowContent;
  settings: WindowSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type WindowType = 
  | 'code' 
  | 'github' 
  | 'database' 
  | 'terminal' 
  | 'browser' 
  | 'files' 
  | 'settings'
  | 'chat'
  | 'preview';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowContent {
  [key: string]: any;
  filePath?: string;
  language?: string;
  code?: string;
  url?: string;
  data?: any;
}

export interface WindowSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  autoSave: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  minimap?: boolean;
}

export interface CreateWindowData {
  title: string;
  type: WindowType;
  projectId?: number;
  position?: WindowPosition;
  size?: WindowSize;
  content?: WindowContent;
}

export interface UpdateWindowStateData {
  state?: WindowState;
  position?: WindowPosition;
  size?: WindowSize;
  zIndex?: number;
  isActive?: boolean;
}

export interface WindowsResponse {
  message: string;
  windows: AppWindow[];
  stats: {
    total: number;
    active: number;
    minimized: number;
    maximized: number;
  };
}

export interface WorkspaceLayout {
  windows: Partial<AppWindow>[];
  timestamp: Date;
  totalWindows: number;
}

// Configuration par défaut pour les fenêtres
export const DEFAULT_WINDOW_CONFIG = {
  size: {
    width: 800,
    height: 600
  },
  position: {
    x: 50,
    y: 50
  },
  settings: {
    theme: 'dark' as const,
    fontSize: 14,
    autoSave: true,
    lineNumbers: true,
    wordWrap: true,
    minimap: false
  }
};