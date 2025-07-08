export interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  status: 'active' | 'archived' | 'draft';
  visibility: 'private' | 'public' | 'team';
  userId: number;
  collaborators: number[];
  stats: ProjectStats;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStats {
  files: number;
  commits: number;
  branches: number;
  lastActivity: Date;
  age?: number;
  contributors?: number;
  activity?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  languages?: LanguageStats[];
}

export interface LanguageStats {
  name: string;
  percentage: number;
}

export interface ProjectSettings {
  autoSave: boolean;
  linting: boolean;
  testing: boolean;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  technologies?: string[];
  visibility?: 'private' | 'public' | 'team';
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  technologies?: string[];
  status?: 'active' | 'archived' | 'draft';
  visibility?: 'private' | 'public' | 'team';
}

export interface ProjectsResponse {
  message: string;
  projects: Project[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}