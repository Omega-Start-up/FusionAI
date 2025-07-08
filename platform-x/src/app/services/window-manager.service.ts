import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppWindow, WindowType, WindowPosition, WindowSize } from '../models/window.model';

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  private windows = new BehaviorSubject<AppWindow[]>([]);
  public windows$ = this.windows.asObservable();
  private nextZIndex = 1000;
  private viewContainerRef!: ViewContainerRef;

  constructor() {}

  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  openWindow(type: WindowType, title?: string, data?: any): string {
    const windowId = this.generateWindowId();
    const newWindow: AppWindow = {
      id: windowId,
      title: title || this.getDefaultTitle(type),
      component: this.getComponentName(type),
      position: this.getDefaultPosition(),
      size: this.getDefaultSize(type),
      isMinimized: false,
      isMaximized: false,
      isVisible: true,
      zIndex: this.nextZIndex++,
      data
    };

    const currentWindows = this.windows.value;
    this.windows.next([...currentWindows, newWindow]);
    return windowId;
  }

  closeWindow(windowId: string): void {
    const currentWindows = this.windows.value;
    this.windows.next(currentWindows.filter(w => w.id !== windowId));
  }

  minimizeWindow(windowId: string): void {
    this.updateWindow(windowId, { isMinimized: true, isVisible: false });
  }

  maximizeWindow(windowId: string): void {
    const window = this.getWindow(windowId);
    if (window) {
      this.updateWindow(windowId, { 
        isMaximized: !window.isMaximized,
        position: window.isMaximized ? this.getDefaultPosition() : { x: 0, y: 60 },
        size: window.isMaximized ? this.getDefaultSize(WindowType.CODE_EDITOR) : { width: window.innerWidth || 1200, height: (window.innerHeight || 800) - 60 }
      });
    }
  }

  restoreWindow(windowId: string): void {
    this.updateWindow(windowId, { isMinimized: false, isVisible: true });
  }

  bringToFront(windowId: string): void {
    this.updateWindow(windowId, { zIndex: this.nextZIndex++ });
  }

  moveWindow(windowId: string, position: WindowPosition): void {
    this.updateWindow(windowId, { position });
  }

  resizeWindow(windowId: string, size: WindowSize): void {
    this.updateWindow(windowId, { size });
  }

  getWindow(windowId: string): AppWindow | undefined {
    return this.windows.value.find(w => w.id === windowId);
  }

  getVisibleWindows(): AppWindow[] {
    return this.windows.value
      .filter(w => w.isVisible && !w.isMinimized)
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  getMinimizedWindows(): AppWindow[] {
    return this.windows.value.filter(w => w.isMinimized);
  }

  closeAllWindows(): void {
    this.windows.next([]);
  }

  private updateWindow(windowId: string, updates: Partial<AppWindow>): void {
    const currentWindows = this.windows.value;
    const windowIndex = currentWindows.findIndex(w => w.id === windowId);
    
    if (windowIndex !== -1) {
      const updatedWindows = [...currentWindows];
      updatedWindows[windowIndex] = { ...updatedWindows[windowIndex], ...updates };
      this.windows.next(updatedWindows);
    }
  }

  private generateWindowId(): string {
    return `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultTitle(type: WindowType): string {
    const titles = {
      [WindowType.CODE_EDITOR]: 'Éditeur de code',
      [WindowType.GITHUB_BROWSER]: 'GitHub',
      [WindowType.DATABASE_VIEWER]: 'Base de données',
      [WindowType.PROJECT_MANAGER]: 'Gestionnaire de projets',
      [WindowType.SETTINGS]: 'Paramètres',
      [WindowType.TEAM_INVITE]: 'Inviter une équipe'
    };
    return titles[type] || 'Fenêtre';
  }

  private getComponentName(type: WindowType): string {
    const components = {
      [WindowType.CODE_EDITOR]: 'CodeEditorComponent',
      [WindowType.GITHUB_BROWSER]: 'GithubBrowserComponent',
      [WindowType.DATABASE_VIEWER]: 'DatabaseViewerComponent',
      [WindowType.PROJECT_MANAGER]: 'ProjectManagerComponent',
      [WindowType.SETTINGS]: 'SettingsComponent',
      [WindowType.TEAM_INVITE]: 'TeamInviteComponent'
    };
    return components[type] || 'DefaultComponent';
  }

  private getDefaultPosition(): WindowPosition {
    const offset = this.windows.value.length * 30;
    return {
      x: 100 + offset,
      y: 100 + offset
    };
  }

  private getDefaultSize(type: WindowType): WindowSize {
    const sizes = {
      [WindowType.CODE_EDITOR]: { width: 800, height: 600 },
      [WindowType.GITHUB_BROWSER]: { width: 600, height: 500 },
      [WindowType.DATABASE_VIEWER]: { width: 700, height: 550 },
      [WindowType.PROJECT_MANAGER]: { width: 500, height: 400 },
      [WindowType.SETTINGS]: { width: 450, height: 350 },
      [WindowType.TEAM_INVITE]: { width: 400, height: 300 }
    };
    return sizes[type] || { width: 600, height: 400 };
  }
}