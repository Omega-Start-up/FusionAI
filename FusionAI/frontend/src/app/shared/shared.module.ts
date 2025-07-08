import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// Composants partagés (à créer progressivement)
// import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
// import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
// import { FileUploadComponent } from './components/file-upload/file-upload.component';
// import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
// import { EmptyStateComponent } from './components/empty-state/empty-state.component';
// import { SearchBarComponent } from './components/search-bar/search-bar.component';
// import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
// import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
// import { StatsCardComponent } from './components/stats-card/stats-card.component';
// import { ActionMenuComponent } from './components/action-menu/action-menu.component';

// Directives partagées (à créer progressivement)
// import { AutofocusDirective } from './directives/autofocus.directive';
// import { ClickOutsideDirective } from './directives/click-outside.directive';
// import { LazyLoadDirective } from './directives/lazy-load.directive';
// import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';

// Pipes partagés (à créer progressivement)
// import { TimeAgoPipe } from './pipes/time-ago.pipe';
// import { FileSizePipe } from './pipes/file-size.pipe';
// import { TruncatePipe } from './pipes/truncate.pipe';
// import { HighlightPipe } from './pipes/highlight.pipe';
// import { SafeHtmlPipe } from './pipes/safe-html.pipe';

// Tous les modules Material à exporter
const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatMenuModule,
  MatBadgeModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatDialogModule,
  MatTooltipModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatExpansionModule,
  MatListModule,
  MatSidenavModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
];

// Composants à exporter (à activer progressivement)
const COMPONENTS: any[] = [
  // LoadingSpinnerComponent,
  // ConfirmDialogComponent,
  // FileUploadComponent,
  // UserAvatarComponent,
  // EmptyStateComponent,
  // SearchBarComponent,
  // ThemeToggleComponent,
  // BreadcrumbsComponent,
  // StatsCardComponent,
  // ActionMenuComponent,
];

// Directives à exporter (à activer progressivement)
const DIRECTIVES: any[] = [
  // AutofocusDirective,
  // ClickOutsideDirective,
  // LazyLoadDirective,
  // InfiniteScrollDirective,
];

// Pipes à exporter (à activer progressivement)
const PIPES: any[] = [
  // TimeAgoPipe,
  // FileSizePipe,
  // TruncatePipe,
  // HighlightPipe,
  // SafeHtmlPipe,
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ...MATERIAL_MODULES,
  ],
  exports: [
    // Modules de base
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    
    // Material modules
    ...MATERIAL_MODULES,
    
    // Nos composants
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ]
})
export class SharedModule {}