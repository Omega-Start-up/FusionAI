import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Shared module pour Material UI
import { SharedModule } from '@shared/shared.module';

// Routing
import { WorkspaceRoutingModule } from './workspace-routing.module';

// Layout (à créer)
// import { WorkspaceLayoutComponent } from './components/workspace-layout/workspace-layout.component';

// Dashboard (à créer)
// import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { DashboardStatsComponent } from './components/dashboard/dashboard-stats.component';
// import { RecentProjectsComponent } from './components/dashboard/recent-projects.component';
// import { QuickActionsComponent } from './components/dashboard/quick-actions.component';

// Projets (à créer)
// import { ProjectListComponent } from './components/projects/project-list.component';
// import { ProjectCardComponent } from './components/projects/project-card.component';
// import { ProjectDetailComponent } from './components/projects/project-detail.component';
// import { ProjectFormComponent } from './components/projects/project-form.component';

// Composants partagés du workspace (à créer)
// import { WorkspaceSidebarComponent } from './components/shared/workspace-sidebar.component';
// import { WorkspaceHeaderComponent } from './components/shared/workspace-header.component';
// import { ProjectSearchComponent } from './components/shared/project-search.component';

// Services spécifiques au workspace (à créer)
// import { WorkspaceStateService } from './services/workspace-state.service';
// import { ProjectFormService } from './services/project-form.service';

@NgModule({
  declarations: [
    // Layout (à créer)
    // WorkspaceLayoutComponent,
    // WorkspaceSidebarComponent,
    // WorkspaceHeaderComponent,
    
    // Dashboard (à créer)
    // DashboardComponent,
    // DashboardStatsComponent,
    // RecentProjectsComponent,
    // QuickActionsComponent,
    
    // Projets (à créer)
    // ProjectListComponent,
    // ProjectCardComponent,
    // ProjectDetailComponent,
    // ProjectFormComponent,
    
    // Shared (à créer)
    // ProjectSearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    WorkspaceRoutingModule
  ],
  providers: [
    // WorkspaceStateService,
    // ProjectFormService
  ]
})
export class WorkspaceModule { }