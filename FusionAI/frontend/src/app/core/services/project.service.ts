import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  Project,
  ProjectsResponse,
  CreateProjectData,
  UpdateProjectData,
  ProjectStats
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}${environment.endpoints.projects}`;
  
  // État des projets avec signals
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  
  public projects = signal<Project[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Charger tous les projets de l'utilisateur
   */
  loadProjects(params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Observable<ProjectsResponse> {
    this.isLoading.set(true);
    this.error.set(null);
    
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.offset) httpParams = httpParams.set('offset', params.offset.toString());
    
    return this.http.get<ProjectsResponse>(this.apiUrl, { params: httpParams }).pipe(
      tap(response => {
        this.projects.set(response.projects);
        this.projectsSubject.next(response.projects);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement des projets');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtenir un projet par ID
   */
  getProject(projectId: number): Observable<{ project: Project }> {
    return this.http.get<{ project: Project }>(`${this.apiUrl}/${projectId}`).pipe(
      catchError(error => {
        this.error.set('Erreur lors de la récupération du projet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Créer un nouveau projet
   */
  createProject(data: CreateProjectData): Observable<{ project: Project }> {
    this.isLoading.set(true);
    
    return this.http.post<{ project: Project }>(this.apiUrl, data).pipe(
      tap(response => {
        this.addProjectToState(response.project);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la création du projet');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour un projet
   */
  updateProject(projectId: number, data: UpdateProjectData): Observable<{ project: Project }> {
    return this.http.put<{ project: Project }>(`${this.apiUrl}/${projectId}`, data).pipe(
      tap(response => {
        this.updateProjectInState(response.project);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise à jour du projet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer un projet
   */
  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}`).pipe(
      tap(() => {
        this.removeProjectFromState(projectId);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la suppression du projet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtenir les statistiques d'un projet
   */
  getProjectStats(projectId: number): Observable<{ stats: ProjectStats }> {
    return this.http.get<{ stats: ProjectStats }>(`${this.apiUrl}/${projectId}/stats`).pipe(
      catchError(error => {
        this.error.set('Erreur lors de la récupération des statistiques');
        return throwError(() => error);
      })
    );
  }

  /**
   * Gérer les collaborateurs d'un projet
   */
  manageCollaborator(
    projectId: number, 
    action: 'add' | 'remove', 
    userId: number
  ): Observable<{ collaborators: number[] }> {
    return this.http.put<{ collaborators: number[] }>(
      `${this.apiUrl}/${projectId}/collaborators`, 
      { action, userId }
    ).pipe(
      tap(response => {
        this.updateProjectCollaboratorsInState(projectId, response.collaborators);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la gestion des collaborateurs');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour les paramètres d'un projet
   */
  updateProjectSettings(
    projectId: number,
    settings: Partial<{ autoSave: boolean; linting: boolean; testing: boolean }>
  ): Observable<{ settings: any }> {
    return this.http.put<{ settings: any }>(
      `${this.apiUrl}/${projectId}/settings`,
      { settings }
    ).pipe(
      tap(response => {
        this.updateProjectSettingsInState(projectId, response.settings);
      }),
      catchError(error => {
        this.error.set('Erreur lors de la mise à jour des paramètres');
        return throwError(() => error);
      })
    );
  }

  // === Méthodes utilitaires locales ===

  /**
   * Ajouter un projet à l'état local
   */
  private addProjectToState(project: Project): void {
    const currentProjects = this.projects();
    this.projects.set([project, ...currentProjects]);
    this.projectsSubject.next(this.projects());
  }

  /**
   * Mettre à jour un projet dans l'état local
   */
  private updateProjectInState(updatedProject: Project): void {
    const currentProjects = this.projects();
    const index = currentProjects.findIndex(p => p.id === updatedProject.id);
    
    if (index !== -1) {
      const newProjects = [...currentProjects];
      newProjects[index] = updatedProject;
      this.projects.set(newProjects);
      this.projectsSubject.next(newProjects);
    }
  }

  /**
   * Supprimer un projet de l'état local
   */
  private removeProjectFromState(projectId: number): void {
    const currentProjects = this.projects();
    const newProjects = currentProjects.filter(p => p.id !== projectId);
    this.projects.set(newProjects);
    this.projectsSubject.next(newProjects);
  }

  /**
   * Mettre à jour les collaborateurs dans l'état local
   */
  private updateProjectCollaboratorsInState(projectId: number, collaborators: number[]): void {
    const currentProjects = this.projects();
    const index = currentProjects.findIndex(p => p.id === projectId);
    
    if (index !== -1) {
      const newProjects = [...currentProjects];
      newProjects[index] = { ...newProjects[index], collaborators };
      this.projects.set(newProjects);
      this.projectsSubject.next(newProjects);
    }
  }

  /**
   * Mettre à jour les paramètres dans l'état local
   */
  private updateProjectSettingsInState(projectId: number, settings: any): void {
    const currentProjects = this.projects();
    const index = currentProjects.findIndex(p => p.id === projectId);
    
    if (index !== -1) {
      const newProjects = [...currentProjects];
      newProjects[index] = { 
        ...newProjects[index], 
        settings: { ...newProjects[index].settings, ...settings }
      };
      this.projects.set(newProjects);
      this.projectsSubject.next(newProjects);
    }
  }

  // === Méthodes utilitaires publiques ===

  /**
   * Obtenir un projet par ID depuis l'état local
   */
  getProjectFromState(projectId: number): Project | undefined {
    return this.projects().find(p => p.id === projectId);
  }

  /**
   * Filtrer les projets par statut
   */
  getProjectsByStatus(status: 'active' | 'archived' | 'draft'): Project[] {
    return this.projects().filter(p => p.status === status);
  }

  /**
   * Rechercher des projets par nom ou description
   */
  searchProjects(query: string): Project[] {
    const searchLower = query.toLowerCase();
    return this.projects().filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.technologies.some(tech => tech.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Obtenir le nombre total de projets
   */
  getProjectCount(): number {
    return this.projects().length;
  }

  /**
   * Vérifier si l'utilisateur peut créer plus de projets
   */
  canCreateMoreProjects(): boolean {
    // Limitation basée sur le plan utilisateur (à implémenter selon la logique métier)
    return this.projects().length < 50; // Exemple: max 50 projets
  }

  /**
   * Obtenir les projets récents (modifiés dans les 7 derniers jours)
   */
  getRecentProjects(): Project[] {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return this.projects().filter(p => 
      new Date(p.updatedAt) > weekAgo
    ).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}