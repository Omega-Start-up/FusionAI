// User models
export * from './user.model';

// Project models  
export * from './project.model';

// Window models
export * from './window.model';

// File models
export * from './file.model';

// Common response interface
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  status?: number;
}

// Common pagination interface
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}