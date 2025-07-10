import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Project } from '@models/index';

export interface ProjectState extends EntityState<Project> {
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filters: {
    status: string[];
    tags: string[];
  };
}

export const projectAdapter: EntityAdapter<Project> = createEntityAdapter<Project>({
  selectId: (project: Project) => project.id,
  sortComparer: (a: Project, b: Project) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
});

export const initialState: ProjectState = projectAdapter.getInitialState({
  selectedProjectId: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  filters: {
    status: [],
    tags: []
  }
});

export const projectReducer = createReducer(
  initialState,
  // Actions would be defined here
);