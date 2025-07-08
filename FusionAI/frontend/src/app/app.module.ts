import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Modules principaux
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Composants principaux
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    
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