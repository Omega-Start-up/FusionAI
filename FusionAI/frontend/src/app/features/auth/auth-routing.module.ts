import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Connexion', description: 'Connectez-vous à votre compte FusionAI' }
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Inscription', description: 'Créez votre compte FusionAI gratuit' }
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Mot de passe oublié', description: 'Réinitialisez votre mot de passe' }
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { title: 'Nouveau mot de passe', description: 'Définissez votre nouveau mot de passe' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }