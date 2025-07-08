import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { WindowManagerService } from '../../services/window-manager.service';
import { WindowType } from '../../models/window.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-workspace-page',
  templateUrl: './workspace-page.component.html',
  styleUrls: ['./workspace-page.component.scss']
})
export class WorkspacePageComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private windowManager: WindowManagerService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
  }

  openCodeEditor(): void {
    this.windowManager.openWindow(WindowType.CODE_EDITOR, 'Mon Projet');
  }

  openGithubBrowser(): void {
    this.windowManager.openWindow(WindowType.GITHUB_BROWSER);
  }

  openDatabaseViewer(): void {
    this.windowManager.openWindow(WindowType.DATABASE_VIEWER);
  }

  openProjectManager(): void {
    this.windowManager.openWindow(WindowType.PROJECT_MANAGER);
  }

  createNewProject(): void {
    // Implementation for creating new project
    console.log('Creating new project...');
  }

  importProject(): void {
    // Implementation for importing project
    console.log('Importing project...');
  }
}