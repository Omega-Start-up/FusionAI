import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { WorkspacePageComponent } from './pages/workspace-page/workspace-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { CommunityPageComponent } from './pages/community-page/community-page.component';
import { EnterprisePageComponent } from './pages/enterprise-page/enterprise-page.component';
import { LearnPageComponent } from './pages/learn-page/learn-page.component';
import { ShippedPageComponent } from './pages/shipped-page/shipped-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'workspace', component: WorkspacePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'community', component: CommunityPageComponent },
  { path: 'enterprise', component: EnterprisePageComponent },
  { path: 'learn', component: LearnPageComponent },
  { path: 'shipped', component: ShippedPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }