export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Fantasy' | 'Horror' | 'Romance' | 'SciFi';

export interface User {
  id: string;
  username: string;
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director: string;
  actors: string[];
  posterUrl?: string;
  backdropUrl?: string;
}

export interface TVShow {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  posterUrl?: string;
  backdropUrl?: string;
  episodes: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}

export interface MyListItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tvshow';
  addedAt: Date;
  content?: Movie | TVShow;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  posterUrl?: string;
  backdropUrl?: string;
  contentType: 'movie' | 'tvshow';
  // Movie-specific fields (optional)
  releaseDate?: Date;
  director?: string;
  actors?: string[];
  // TV Show-specific fields (optional)
  episodes?: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}

// Authentication types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<AuthUser, 'password'>;
  message: string;
}
