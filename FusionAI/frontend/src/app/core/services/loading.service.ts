import { Injectable, signal, computed } from '@angular/core';

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  type?: 'primary' | 'secondary' | 'accent';
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = signal<LoadingState[]>([]);
  
  // Computed signals
  public isLoading = computed(() => this.loadingStates().length > 0);
  public loadingCount = computed(() => this.loadingStates().length);
  public primaryLoading = computed(() => 
    this.loadingStates().find(state => state.type === 'primary' || !state.type)
  );

  /**
   * Démarrer un état de loading
   */
  start(id: string, message?: string, type: 'primary' | 'secondary' | 'accent' = 'primary'): void {
    const currentStates = this.loadingStates();
    
    // Éviter les doublons
    if (currentStates.find(state => state.id === id)) {
      return;
    }

    const newState: LoadingState = {
      id,
      message,
      type,
      progress: 0
    };

    this.loadingStates.set([...currentStates, newState]);
  }

  /**
   * Arrêter un état de loading
   */
  stop(id: string): void {
    const currentStates = this.loadingStates();
    const updatedStates = currentStates.filter(state => state.id !== id);
    this.loadingStates.set(updatedStates);
  }

  /**
   * Mettre à jour le message d'un loading
   */
  updateMessage(id: string, message: string): void {
    const currentStates = this.loadingStates();
    const updatedStates = currentStates.map(state => 
      state.id === id ? { ...state, message } : state
    );
    this.loadingStates.set(updatedStates);
  }

  /**
   * Mettre à jour le progrès d'un loading
   */
  updateProgress(id: string, progress: number): void {
    const currentStates = this.loadingStates();
    const updatedStates = currentStates.map(state => 
      state.id === id ? { ...state, progress: Math.max(0, Math.min(100, progress)) } : state
    );
    this.loadingStates.set(updatedStates);
  }

  /**
   * Obtenir un état de loading spécifique
   */
  getLoadingState(id: string): LoadingState | undefined {
    return this.loadingStates().find(state => state.id === id);
  }

  /**
   * Obtenir tous les états de loading
   */
  getAllLoadingStates() {
    return this.loadingStates.asReadonly();
  }

  /**
   * Vérifier si un ID spécifique est en loading
   */
  isLoadingId(id: string): boolean {
    return this.loadingStates().some(state => state.id === id);
  }

  /**
   * Arrêter tous les loadings
   */
  stopAll(): void {
    this.loadingStates.set([]);
  }

  /**
   * Méthodes utilitaires pour les opérations courantes
   */
  
  // API Calls
  startApiCall(endpoint: string): void {
    this.start(`api-${endpoint}`, `Chargement ${endpoint}...`);
  }

  stopApiCall(endpoint: string): void {
    this.stop(`api-${endpoint}`);
  }

  // File operations
  startFileUpload(fileName: string): void {
    this.start(`upload-${fileName}`, `Upload ${fileName}...`, 'secondary');
  }

  updateFileUploadProgress(fileName: string, progress: number): void {
    this.updateProgress(`upload-${fileName}`, progress);
  }

  stopFileUpload(fileName: string): void {
    this.stop(`upload-${fileName}`);
  }

  // Auth operations
  startAuthOperation(operation: string): void {
    this.start(`auth-${operation}`, `${operation}...`);
  }

  stopAuthOperation(operation: string): void {
    this.stop(`auth-${operation}`);
  }

  // Page loading
  startPageLoad(page: string): void {
    this.start(`page-${page}`, `Chargement de la page...`);
  }

  stopPageLoad(page: string): void {
    this.stop(`page-${page}`);
  }

  // Component loading
  startComponentLoad(componentName: string): void {
    this.start(`component-${componentName}`, 'Chargement...', 'secondary');
  }

  stopComponentLoad(componentName: string): void {
    this.stop(`component-${componentName}`);
  }

  /**
   * Wrapper pour les opérations asynchrones
   */
  async withLoading<T>(
    id: string,
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> {
    try {
      this.start(id, message);
      const result = await operation();
      return result;
    } finally {
      this.stop(id);
    }
  }

  /**
   * Wrapper pour les opérations avec progrès
   */
  async withProgress<T>(
    id: string,
    operation: (progressCallback: (progress: number) => void) => Promise<T>,
    message?: string
  ): Promise<T> {
    try {
      this.start(id, message);
      
      const progressCallback = (progress: number) => {
        this.updateProgress(id, progress);
      };
      
      const result = await operation(progressCallback);
      return result;
    } finally {
      this.stop(id);
    }
  }
}