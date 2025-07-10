import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Imports temporairement commentés
// import { WorkspaceLayoutComponent } from './components/workspace-layout/workspace-layout.component';
// import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { ProjectListComponent } from './components/projects/project-list.component';
// import { ProjectDetailComponent } from './components/projects/project-detail.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Workspace - À implémenter', breadcrumb: 'Workspace' }
  }
  // Routes temporairement commentées
  // {
  //   path: '',
  //   component: WorkspaceLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'dashboard',
  //       pathMatch: 'full'
  //     },
  //     {
  //       path: 'dashboard',
  //       component: DashboardComponent,
  //       data: { title: 'Tableau de bord', breadcrumb: 'Dashboard' }
  //     },
  //     {
  //       path: 'projects',
  //       component: ProjectListComponent,
  //       data: { title: 'Mes projets', breadcrumb: 'Projets' }
  //     },
  //     {
  //       path: 'projects/:id',
  //       component: ProjectDetailComponent,
  //       data: { title: 'Détail du projet', breadcrumb: 'Détail' }
  //     },
  //     {
  //       path: 'files',
  //       loadComponent: () => import('../files/components/file-manager.component').then(m => m.FileManagerComponent),
  //       data: { title: 'Mes fichiers', breadcrumb: 'Fichiers' }
  //     },
  //     {
  //       path: 'settings',
  //       loadComponent: () => import('../settings/components/workspace-settings.component').then(m => m.WorkspaceSettingsComponent),
  //       data: { title: 'Paramètres', breadcrumb: 'Paramètres' }
  //     }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }