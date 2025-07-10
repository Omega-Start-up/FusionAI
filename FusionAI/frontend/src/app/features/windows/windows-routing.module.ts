import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Windows - À implémenter', breadcrumb: 'Windows' }
  }
  // Routes Windows à implémenter
  // {
  //   path: '',
  //   component: WindowManagerComponent,
  //   children: [
  //     {
  //       path: 'floating/:id',
  //       component: FloatingWindowComponent
  //     },
  //     {
  //       path: 'container/:containerId',
  //       component: WindowContainerComponent
  //     }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WindowsRoutingModule { }