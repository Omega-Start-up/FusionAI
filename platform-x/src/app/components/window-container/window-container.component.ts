import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WindowManagerService } from '../../services/window-manager.service';
import { AppWindow } from '../../models/window.model';

@Component({
  selector: 'app-window-container',
  templateUrl: './window-container.component.html',
  styleUrls: ['./window-container.component.scss']
})
export class WindowContainerComponent implements OnInit, OnDestroy {
  @ViewChild('windowContainer', { read: ViewContainerRef, static: true }) 
  windowContainer!: ViewContainerRef;

  windows: AppWindow[] = [];
  minimizedWindows: AppWindow[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private windowManager: WindowManagerService
  ) {}

  ngOnInit(): void {
    this.windowManager.setViewContainerRef(this.windowContainer);
    
    this.windowManager.windows$
      .pipe(takeUntil(this.destroy$))
      .subscribe(windows => {
        this.windows = this.windowManager.getVisibleWindows();
        this.minimizedWindows = this.windowManager.getMinimizedWindows();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onWindowMinimize(windowId: string): void {
    this.windowManager.minimizeWindow(windowId);
  }

  onWindowMaximize(windowId: string): void {
    this.windowManager.maximizeWindow(windowId);
  }

  onWindowClose(windowId: string): void {
    this.windowManager.closeWindow(windowId);
  }

  onWindowMove(windowId: string, position: { x: number, y: number }): void {
    this.windowManager.moveWindow(windowId, position);
  }

  onWindowResize(windowId: string, size: { width: number, height: number }): void {
    this.windowManager.resizeWindow(windowId, size);
  }

  onWindowFocus(windowId: string): void {
    this.windowManager.bringToFront(windowId);
  }

  onRestoreWindow(windowId: string): void {
    this.windowManager.restoreWindow(windowId);
  }

  trackByWindowId(index: number, window: AppWindow): string {
    return window.id;
  }

  getWindowIcon(component: string): string {
    const icons: { [key: string]: string } = {
      'CodeEditorComponent': 'code',
      'GithubBrowserComponent': 'source',
      'DatabaseViewerComponent': 'storage',
      'ProjectManagerComponent': 'folder',
      'SettingsComponent': 'settings',
      'TeamInviteComponent': 'mail'
    };
    return icons[component] || 'window';
  }
}