import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

// Services Core (singletons)
import { AuthService } from './services/auth.service';
import { WindowService } from './services/window.service';
import { ProjectService } from './services/project.service';
import { FileService } from './services/file.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import { LoadingService } from './services/loading.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { RoleGuard } from './guards/role.guard';

@NgModule({
  imports: [CommonModule],
  providers: [
    // Services singletons
    AuthService,
    WindowService,
    ProjectService,
    FileService,
    NotificationService,
    ThemeService,
    LoadingService,
    
    // Guards (functional guards n'ont pas besoin d'être fournis comme providers)
    
    // Interceptors en tant que providers
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useValue: errorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useValue: loadingInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}