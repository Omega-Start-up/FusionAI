import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { WindowManagerService } from '../../services/window-manager.service';
import { User } from '../../models/user.model';
import { WindowType } from '../../models/window.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showUserMenu = false;
  showLoginMenu = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private windowManager: WindowManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  // Navigation actions for authenticated users
  onHomeClick(): void {
    if (this.isAuthenticated) {
      // Toggle windows or navigate to workspace
      this.router.navigate(['/workspace']);
    }
  }

  onCodeClick(): void {
    this.windowManager.openWindow(WindowType.CODE_EDITOR);
  }

  onGithubClick(): void {
    this.windowManager.openWindow(WindowType.GITHUB_BROWSER);
  }

  onDatabaseClick(): void {
    this.windowManager.openWindow(WindowType.DATABASE_VIEWER);
  }

  onInviteClick(): void {
    this.windowManager.openWindow(WindowType.TEAM_INVITE);
  }

  onUpgradeClick(): void {
    this.router.navigate(['/upgrade']);
  }

  onPublishClick(): void {
    // Open publish dialog or navigate to publish page
    console.log('Publish project');
  }

  // User menu actions
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showLoginMenu = false;
  }

  toggleLoginMenu(): void {
    this.showLoginMenu = !this.showLoginMenu;
    this.showUserMenu = false;
  }

  onProfileClick(): void {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  onSettingsClick(): void {
    this.showUserMenu = false;
    this.windowManager.openWindow(WindowType.SETTINGS);
  }

  onLogoutClick(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  onLoginClick(): void {
    this.showLoginMenu = false;
    this.router.navigate(['/login']);
  }

  onSignupClick(): void {
    this.showLoginMenu = false;
    this.router.navigate(['/signup']);
  }

  // Navigation for public pages
  onPublicPageClick(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  // Close menus when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.login-menu')) {
      this.showUserMenu = false;
      this.showLoginMenu = false;
    }
  }
}