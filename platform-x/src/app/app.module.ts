import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { WindowContainerComponent } from './components/window-container/window-container.component';
import { WindowComponent } from './components/window/window.component';

// Pages
import { HomePageComponent } from './pages/home-page/home-page.component';
import { WorkspacePageComponent } from './pages/workspace-page/workspace-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { CommunityPageComponent } from './pages/community-page/community-page.component';
import { EnterprisePageComponent } from './pages/enterprise-page/enterprise-page.component';
import { LearnPageComponent } from './pages/learn-page/learn-page.component';
import { ShippedPageComponent } from './pages/shipped-page/shipped-page.component';

// Window Components
import { CodeEditorComponent } from './components/windows/code-editor/code-editor.component';
import { GithubBrowserComponent } from './components/windows/github-browser/github-browser.component';
import { DatabaseViewerComponent } from './components/windows/database-viewer/database-viewer.component';
import { ProjectManagerComponent } from './components/windows/project-manager/project-manager.component';
import { SettingsComponent } from './components/windows/settings/settings.component';
import { TeamInviteComponent } from './components/windows/team-invite/team-invite.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    WindowContainerComponent,
    WindowComponent,
    HomePageComponent,
    WorkspacePageComponent,
    LoginPageComponent,
    SignupPageComponent,
    CommunityPageComponent,
    EnterprisePageComponent,
    LearnPageComponent,
    ShippedPageComponent,
    CodeEditorComponent,
    GithubBrowserComponent,
    DatabaseViewerComponent,
    ProjectManagerComponent,
    SettingsComponent,
    TeamInviteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    
    // Angular Material
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }