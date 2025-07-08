export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  initials?: string;
  isAuthenticated: boolean;
  subscription?: 'free' | 'pro' | 'enterprise';
  projects?: Project[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  githubUrl?: string;
}