import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  AppFile,
  FileUploadData,
  UpdateFileData,
  FilesResponse,
  FileStats,
  FileSearchParams,
  FileSearchResponse,
  FileUtils
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = `${environment.apiUrl}${environment.endpoints.files}`;
  
  // État des fichiers avec signals
  private filesSubject = new BehaviorSubject<AppFile[]>([]);
  public files$ = this.filesSubject.asObservable();
  
  public files = signal<AppFile[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public uploadProgress = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Charger tous les fichiers de l'utilisateur
   */
  loadFiles(params?: {
    limit?: number;
    offset?: number;
    projectId?: number;
  }): Observable<FilesResponse> {
    this.isLoading.set(true);
    this.error.set(null);
    
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.projectId) searchParams.set('projectId', params.projectId.toString());
    
    const url = searchParams.toString() ? `${this.apiUrl}?${searchParams}` : this.apiUrl;
    
    return this.http.get<FilesResponse>(url).pipe(
      tap(response => {
        this.files.set(response.files);
        this.filesSubject.next(response.files);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement des fichiers');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtenir un fichier par ID
   */
  getFile(fileId: number): Observable<{ file: AppFile }> {
    return this.http.get<{ file: AppFile }>(`${this.apiUrl}/${fileId}`).pipe(
      catchError(error => {
        this.error.set('Erreur lors de la récupération du fichier');
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload de fichiers avec suivi du progrès
   */
  uploadFiles(data: FileUploadData): Observable<{
    files: AppFile[];
    progress?: number;
    status: 'progress' | 'complete';
  }> {
    this.isLoading.set(true);
    this.uploadProgress.set(0);
    
    const formData = new FormData();
    
    // Ajouter les fichiers
    data.files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });
    
    // Ajouter les métadonnées
    if (data.projectId) {
      formData.append('projectId', data.projectId.toString());
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.tags?.length) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.isPublic !== undefined) {
      formData.append('isPublic', data.isPublic.toString());
    }

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            this.uploadProgress.set(progress);
            return {
              files: [],
              progress,
              status: 'progress' as const
            };
            
          case HttpEventType.Response:
            const response = event.body as { files: AppFile[] };
            this.addFilesToState(response.files);
            this.isLoading.set(false);
            this.uploadProgress.set(100);
            return {
              files: response.files,
              status: 'complete' as const
            };
            
          default:
            return {
              files: [],
              status: 'progress' as const
            };
        }
      }),
      catchError(error => {
        this.error.set('Erreur lors de l\'upload des fichiers');
        this.isLoading.set(false);
        this.uploadProgress.set(0);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour un fichier
   */
  updateFile(fileId: number, data: UpdateFileData): Observable<{ file: AppFile }> {
    return this.http.put<{ file: AppFile }>(`${this.apiUrl}/${fileId}`, data).pipe(
      tap(response => {
        this.updateFileInState(response.file);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise à jour du fichier');
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer un fichier
   */
  deleteFile(fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${fileId}`).pipe(
      tap(() => {
        this.removeFileFromState(fileId);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la suppression du fichier');
        return throwError(() => error);
      })
    );
  }

  /**
   * Télécharger un fichier
   */
  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${fileId}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.error.set('Erreur lors du téléchargement du fichier');
        return throwError(() => error);
      })
    );
  }

  /**
   * Rechercher des fichiers
   */
  searchFiles(params: FileSearchParams): Observable<FileSearchResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });
    
    return this.http.get<FileSearchResponse>(`${this.apiUrl}/search?${searchParams}`).pipe(
      catchError(error => {
        this.error.set('Erreur lors de la recherche de fichiers');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtenir les statistiques des fichiers
   */
  getFileStats(): Observable<{ stats: FileStats }> {
    return this.http.get<{ stats: FileStats }>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        this.error.set('Erreur lors de la récupération des statistiques');
        return throwError(() => error);
      })
    );
  }

  // === Méthodes utilitaires locales ===

  /**
   * Ajouter des fichiers à l'état local
   */
  private addFilesToState(newFiles: AppFile[]): void {
    const currentFiles = this.files();
    this.files.set([...newFiles, ...currentFiles]);
    this.filesSubject.next(this.files());
  }

  /**
   * Mettre à jour un fichier dans l'état local
   */
  private updateFileInState(updatedFile: AppFile): void {
    const currentFiles = this.files();
    const index = currentFiles.findIndex(f => f.id === updatedFile.id);
    
    if (index !== -1) {
      const newFiles = [...currentFiles];
      newFiles[index] = updatedFile;
      this.files.set(newFiles);
      this.filesSubject.next(newFiles);
    }
  }

  /**
   * Supprimer un fichier de l'état local
   */
  private removeFileFromState(fileId: number): void {
    const currentFiles = this.files();
    const newFiles = currentFiles.filter(f => f.id !== fileId);
    this.files.set(newFiles);
    this.filesSubject.next(newFiles);
  }

  // === Méthodes utilitaires publiques ===

  /**
   * Obtenir un fichier par ID depuis l'état local
   */
  getFileFromState(fileId: number): AppFile | undefined {
    return this.files().find(f => f.id === fileId);
  }

  /**
   * Filtrer les fichiers par projet
   */
  getFilesByProject(projectId: number): AppFile[] {
    return this.files().filter(f => f.projectId === projectId);
  }

  /**
   * Filtrer les fichiers par type MIME
   */
  getFilesByType(mimeType: string): AppFile[] {
    return this.files().filter(f => f.mimeType.startsWith(mimeType));
  }

  /**
   * Obtenir les fichiers récents
   */
  getRecentFiles(days: number = 7): AppFile[] {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    
    return this.files()
      .filter(f => new Date(f.createdAt) > dateLimit)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Obtenir la taille totale des fichiers
   */
  getTotalSize(): number {
    return this.files().reduce((total, file) => total + file.size, 0);
  }

  /**
   * Obtenir le nombre total de fichiers
   */
  getFileCount(): number {
    return this.files().length;
  }

  /**
   * Valider un fichier avant upload
   */
  validateFile(file: File, maxSize = 10 * 1024 * 1024): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Vérifier la taille
    if (file.size > maxSize) {
      errors.push(`Le fichier "${file.name}" est trop volumineux (max: ${FileUtils.formatFileSize(maxSize)})`);
    }
    
    // Vérifier le type de fichier (optionnel - selon les besoins)
    const allowedTypes = [
      'image/', 'text/', 'application/json', 'application/pdf', 
      'application/zip', 'video/', 'audio/'
    ];
    
    const isAllowedType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isAllowedType) {
      errors.push(`Le type de fichier "${file.type}" n'est pas autorisé`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valider plusieurs fichiers
   */
  validateFiles(files: File[]): {
    isValid: boolean;
    errors: string[];
    validFiles: File[];
  } {
    const allErrors: string[] = [];
    const validFiles: File[] = [];
    
    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        allErrors.push(...validation.errors);
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validFiles
    };
  }

  /**
   * Créer un lien de téléchargement
   */
  createDownloadLink(file: AppFile): string {
    return `${this.apiUrl}/${file.id}/download`;
  }

  /**
   * Partager un fichier (générer un lien de partage)
   */
  shareFile(fileId: number): Observable<{ shareUrl: string; expiresAt: Date }> {
    return this.http.post<{ shareUrl: string; expiresAt: Date }>(
      `${this.apiUrl}/${fileId}/share`, {}
    );
  }
}