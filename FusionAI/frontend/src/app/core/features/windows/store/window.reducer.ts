import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface WindowInstance {
  id: string;
  type: 'editor' | 'terminal' | 'browser' | 'settings';
  title: string;
  projectId?: string;
  filePath?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  isActive: boolean;
  content?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WindowState extends EntityState<WindowInstance> {
  activeWindowId: string | null;
  maxZIndex: number;
  isLoading: boolean;
  error: string | null;
  layout: 'floating' | 'tabbed' | 'split';
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export const windowAdapter: EntityAdapter<WindowInstance> = createEntityAdapter<WindowInstance>({
  selectId: (window: WindowInstance) => window.id,
  sortComparer: (a: WindowInstance, b: WindowInstance) => b.zIndex - a.zIndex
});

export const initialState: WindowState = windowAdapter.getInitialState({
  activeWindowId: null,
  maxZIndex: 1000,
  isLoading: false,
  error: null,
  layout: 'floating',
  showGrid: false,
  snapToGrid: true,
  gridSize: 20
});

export const windowReducer = createReducer(
  initialState,
  // Actions would be defined here
);