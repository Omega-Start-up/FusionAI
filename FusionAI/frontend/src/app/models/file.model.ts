export interface AppFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  projectId?: number;
  userId: number;
  tags: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadData {
  files: File[];
  projectId?: number;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateFileData {
  name?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface FilesResponse {
  message: string;
  files: AppFile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    totalSize: number;
    totalDownloads: number;
  };
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  publicFiles: number;
  fileTypes: { [key: string]: number };
  projects: { [key: string]: number };
  recentUploads: number;
}

export interface FileSearchParams {
  q?: string;
  projectId?: number;
  mimeType?: string;
  minSize?: number;
  maxSize?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface FileSearchResponse {
  message: string;
  files: AppFile[];
  query: FileSearchParams;
}

// Utilitaires pour les fichiers
export class FileUtils {
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'movie';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'description';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'grid_on';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    if (mimeType.includes('text') || mimeType.includes('json')) return 'code';
    return 'insert_drive_file';
  }

  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  static isCodeFile(mimeType: string): boolean {
    return mimeType.includes('text') || 
           mimeType.includes('javascript') || 
           mimeType.includes('typescript') || 
           mimeType.includes('json') ||
           mimeType.includes('xml');
  }

  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }
}