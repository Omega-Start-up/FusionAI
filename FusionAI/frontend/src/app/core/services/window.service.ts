import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  AppWindow, 
  WindowType, 
  WindowState,
  WindowPosition,
  WindowSize,
  CreateWindowData,
  UpdateWindowStateData,
  WindowsResponse,
  WorkspaceLayout,
  DEFAULT_WINDOW_CONFIG
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private readonly apiUrl = `${environment.apiUrl}${environment.endpoints.windows}`;
  
  // État des fenêtres avec signals
  private windowsSubject = new BehaviorSubject<AppWindow[]>([]);
  public windows$ = this.windowsSubject.asObservable();
  
  public windows = signal<AppWindow[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  
  // Computed signals pour les statistiques
  public activeWindow = computed(() => 
    this.windows().find(w => w.isActive) || null
  );
  
  public minimizedWindows = computed(() => 
    this.windows().filter(w => w.state === 'minimized')
  );
  
  public normalWindows = computed(() => 
    this.windows().filter(w => w.state === 'normal' || w.state === 'maximized')
  );
  
  public maxZIndex = computed(() => 
    Math.max(...this.windows().map(w => w.zIndex), 0)
  );

  constructor(private http: HttpClient) {
    this.loadWindows();
  }

  /**
   * Charger toutes les fenêtres de l'utilisateur
   */
  loadWindows(): Observable<WindowsResponse> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.get<WindowsResponse>(this.apiUrl).pipe(
      tap(response => {
        this.windows.set(response.windows);
        this.windowsSubject.next(response.windows);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement des fenêtres');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Créer une nouvelle fenêtre
   */
  createWindow(data: CreateWindowData): Observable<{ window: AppWindow }> {
    this.isLoading.set(true);
    
    // Calculer la position en cascade pour éviter les superpositions
    const position = this.calculateCascadePosition(data.position);
    const size = data.size || DEFAULT_WINDOW_CONFIG.size;
    
    const windowData = {
      ...data,
      position,
      size
    };
    
    return this.http.post<{ window: AppWindow }>(`${this.apiUrl}`, windowData).pipe(
      tap(response => {
        this.addWindowToState(response.window);
        this.setActiveWindow(response.window.id);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la création de la fenêtre');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour l'état d'une fenêtre
   */
  updateWindowState(windowId: number, data: UpdateWindowStateData): Observable<{ window: AppWindow }> {
    return this.http.put<{ window: AppWindow }>(`${this.apiUrl}/${windowId}/state`, data).pipe(
      tap(response => {
        this.updateWindowInState(response.window);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise à jour de la fenêtre');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour le contenu d'une fenêtre
   */
  updateWindowContent(windowId: number, content: any): Observable<{ content: any }> {
    return this.http.put<{ content: any }>(`${this.apiUrl}/${windowId}/content`, { content }).pipe(
      tap(response => {
        this.updateWindowContentInState(windowId, response.content);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise à jour du contenu');
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer une fenêtre
   */
  deleteWindow(windowId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${windowId}`).pipe(
      tap(() => {
        this.removeWindowFromState(windowId);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la suppression de la fenêtre');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre le focus sur une fenêtre
   */
  focusWindow(windowId: number): Observable<{ window: AppWindow }> {
    return this.http.put<{ window: AppWindow }>(`${this.apiUrl}/focus/${windowId}`, {}).pipe(
      tap(response => {
        this.setActiveWindow(windowId);
        this.updateWindowInState(response.window);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise au point de la fenêtre');
        return throwError(() => error);
      })
    );
  }

  /**
   * Minimiser une fenêtre
   */
  minimizeWindow(windowId: number): void {
    this.updateWindowState(windowId, { state: 'minimized', isActive: false }).subscribe();
  }

  /**
   * Restaurer une fenêtre minimisée
   */
  restoreWindow(windowId: number): void {
    this.updateWindowState(windowId, { 
      state: 'normal', 
      isActive: true,
      zIndex: this.maxZIndex() + 1 
    }).subscribe();
  }

  /**
   * Maximiser une fenêtre
   */
  maximizeWindow(windowId: number): void {
    this.updateWindowState(windowId, { 
      state: 'maximized',
      isActive: true,
      zIndex: this.maxZIndex() + 1
    }).subscribe();
  }

  /**
   * Redimensionner une fenêtre
   */
  resizeWindow(windowId: number, size: WindowSize): void {
    this.updateWindowState(windowId, { size }).subscribe();
  }

  /**
   * Déplacer une fenêtre
   */
  moveWindow(windowId: number, position: WindowPosition): void {
    this.updateWindowState(windowId, { position }).subscribe();
  }

  /**
   * Fermer toutes les fenêtres
   */
  closeAllWindows(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        this.windows.set([]);
        this.windowsSubject.next([]);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la fermeture des fenêtres');
        return throwError(() => error);
      })
    );
  }

  /**
   * Sauvegarder le layout du workspace
   */
  saveWorkspaceLayout(): Observable<{ layout: WorkspaceLayout }> {
    return this.http.get<{ layout: WorkspaceLayout }>(`${this.apiUrl}/workspace/layout`);
  }

  // === Méthodes utilitaires locales ===

  /**
   * Calculer la position en cascade pour une nouvelle fenêtre
   */
  private calculateCascadePosition(preferredPosition?: WindowPosition): WindowPosition {
    if (preferredPosition) {
      return preferredPosition;
    }

    const existingWindows = this.normalWindows();
    const cascade = existingWindows.length * 30; // Décalage de 30px par fenêtre
    
    return {
      x: DEFAULT_WINDOW_CONFIG.position.x + cascade,
      y: DEFAULT_WINDOW_CONFIG.position.y + cascade
    };
  }

  /**
   * Ajouter une fenêtre à l'état local
   */
  private addWindowToState(window: AppWindow): void {
    const currentWindows = this.windows();
    this.windows.set([...currentWindows, window]);
    this.windowsSubject.next(this.windows());
  }

  /**
   * Mettre à jour une fenêtre dans l'état local
   */
  private updateWindowInState(updatedWindow: AppWindow): void {
    const currentWindows = this.windows();
    const index = currentWindows.findIndex(w => w.id === updatedWindow.id);
    
    if (index !== -1) {
      const newWindows = [...currentWindows];
      newWindows[index] = updatedWindow;
      this.windows.set(newWindows);
      this.windowsSubject.next(newWindows);
    }
  }

  /**
   * Mettre à jour le contenu d'une fenêtre dans l'état local
   */
  private updateWindowContentInState(windowId: number, content: any): void {
    const currentWindows = this.windows();
    const index = currentWindows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...currentWindows];
      newWindows[index] = { ...newWindows[index], content };
      this.windows.set(newWindows);
      this.windowsSubject.next(newWindows);
    }
  }

  /**
   * Supprimer une fenêtre de l'état local
   */
  private removeWindowFromState(windowId: number): void {
    const currentWindows = this.windows();
    const newWindows = currentWindows.filter(w => w.id !== windowId);
    this.windows.set(newWindows);
    this.windowsSubject.next(newWindows);
  }

  /**
   * Définir la fenêtre active
   */
  private setActiveWindow(windowId: number): void {
    const currentWindows = this.windows();
    const newWindows = currentWindows.map(w => ({
      ...w,
      isActive: w.id === windowId
    }));
    this.windows.set(newWindows);
    this.windowsSubject.next(newWindows);
  }

  // === Méthodes utilitaires publiques ===

  /**
   * Obtenir une fenêtre par ID
   */
  getWindow(windowId: number): AppWindow | undefined {
    return this.windows().find(w => w.id === windowId);
  }

  /**
   * Obtenir les fenêtres d'un projet
   */
  getProjectWindows(projectId: number): AppWindow[] {
    return this.windows().filter(w => w.projectId === projectId);
  }

  /**
   * Obtenir les fenêtres par type
   */
  getWindowsByType(type: WindowType): AppWindow[] {
    return this.windows().filter(w => w.type === type);
  }

  /**
   * Vérifier si le maximum de fenêtres est atteint
   */
  isMaxWindowsReached(): boolean {
    return this.windows().length >= environment.ui.windows.maxWindows;
  }

  /**
   * Obtenir le nombre de fenêtres ouvertes
   */
  getWindowCount(): number {
    return this.windows().length;
  }
}