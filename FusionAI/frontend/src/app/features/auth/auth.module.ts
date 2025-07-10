import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Shared module pour Material UI
import { SharedModule } from '@shared/shared.module';

// Routing
import { AuthRoutingModule } from './auth-routing.module';

// Composants
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';

// Services spécifiques à Auth
import { AuthFormService } from './services/auth-form.service';
import { AuthValidationService } from './services/auth-validation.service';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AuthRoutingModule
  ],
  providers: [
    AuthFormService,
    AuthValidationService
  ]
})
export class AuthModule { }