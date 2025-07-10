import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Shared module pour Material UI
import { SharedModule } from '@shared/shared.module';

// Routing
import { WindowsRoutingModule } from './windows-routing.module';

// Composants Windows (à créer progressivement)
// import { WindowContainerComponent } from './components/window-container/window-container.component';
// import { WindowHeaderComponent } from './components/window-header/window-header.component';
// import { WindowContentComponent } from './components/window-content/window-content.component';
// import { WindowManagerComponent } from './components/window-manager/window-manager.component';
// import { FloatingWindowComponent } from './components/floating-window/floating-window.component';

// Services Windows (à créer)
// import { WindowDragService } from './services/window-drag.service';
// import { WindowResizeService } from './services/window-resize.service';
// import { WindowLayoutService } from './services/window-layout.service';

@NgModule({
  declarations: [
    // Composants Windows (à créer progressivement)
    // WindowContainerComponent,
    // WindowHeaderComponent,
    // WindowContentComponent,
    // WindowManagerComponent,
    // FloatingWindowComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    DragDropModule,
    WindowsRoutingModule
  ],
  providers: [
    // Services Windows (à créer)
    // WindowDragService,
    // WindowResizeService,
    // WindowLayoutService
  ]
})
export class WindowsModule { }