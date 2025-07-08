export interface User {
  id: number;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  github?: string;
  twitter?: string;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en' | 'es' | 'de';
  notifications: boolean;
  autoSave: boolean;
}

export interface UserStats {
  projectsCreated: number;
  filesUploaded: number;
  windowsOpened: number;
  lastActivity: Date;
  memberSince?: Date;
  daysSinceMember?: number;
  achievements?: Achievement[];
  weeklyActivity?: WeeklyActivity;
}

export interface Achievement {
  name: string;
  unlocked: boolean;
  description?: string;
  unlockedAt?: Date;
}

export interface WeeklyActivity {
  projectsThisWeek: number;
  filesThisWeek: number;
  windowsThisWeek: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}