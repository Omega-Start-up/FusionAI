import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// NgRx imports
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

// Modules principaux
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Composants principaux
import { AppComponent } from './app.component';

// Store imports
import { reducers, metaReducers } from './core/store/app.state';
import { AuthEffects } from './core/features/auth/store/auth.effects';
import { environment } from '@environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    
    // NgRx Store
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: false,
        strictActionSerializability: false
      }
    }),
    
    // NgRx Effects
    EffectsModule.forRoot([AuthEffects]),
    
    // NgRx Router Store
    StoreRouterConnectingModule.forRoot(),
    
    // NgRx DevTools (development only)
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    }),
    
    // Core module (services singletons, interceptors, guards)
    CoreModule,
    
    // Shared module (composants réutilisables, Material)
    SharedModule,
    
    // Routing (doit être en dernier)
    AppRoutingModule
  ],
  providers: [
    // Les providers sont maintenant dans CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }