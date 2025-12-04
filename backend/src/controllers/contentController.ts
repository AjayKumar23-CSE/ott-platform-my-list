import { Request, Response } from 'express';
import { FileStorage } from '../config/fileStorage';
import { Movie, TVShow, PaginatedResponse, ApiResponse, ContentItem } from '../types';

export class ContentController {
  /**
   * Get all movies with pagination
   */
  static async getMovies(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      // Read all movies
      const movies: Movie[] = await FileStorage.readFile<Movie>('movies.json') || [];
      
      // Apply pagination
      const paginatedMovies = movies.slice(offset, offset + limit);
      const totalPages = Math.ceil(movies.length / limit);

      const response: ApiResponse<PaginatedResponse<Movie>> = {
        success: true,
        data: {
          data: paginatedMovies,
          pagination: {
            page,
            limit,
            total: movies.length,
            totalPages
          }
        },
        message: 'Movies retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch movies'
      });
    }
  }

  /**
   * Get all TV shows with pagination
   */
  static async getTVShows(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      // Read all TV shows
      const tvShows: TVShow[] = await FileStorage.readFile<TVShow>('tvshows.json') || [];
      
      // Apply pagination
      const paginatedTVShows = tvShows.slice(offset, offset + limit);
      const totalPages = Math.ceil(tvShows.length / limit);

      const response: ApiResponse<PaginatedResponse<TVShow>> = {
        success: true,
        data: {
          data: paginatedTVShows,
          pagination: {
            page,
            limit,
            total: tvShows.length,
            totalPages
          }
        },
        message: 'TV shows retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch TV shows'
      });
    }
  }

  /**
   * Get all content (movies + TV shows) with pagination
   */
  static async getAllContent(req: Request, res: Response): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 20;
      const offset: number = (page - 1) * limit;

      // Read all movies and TV shows
      const movies: Movie[] = await FileStorage.readFile<Movie>('movies.json') || [];
      const tvShows: TVShow[] = await FileStorage.readFile<TVShow>('tvshows.json') || [];
      
      // Combine and add content type
      const allContent: ContentItem[] = [
        ...movies.map((movie: Movie) => ({ ...movie, contentType: 'movie' as const })),
        ...tvShows.map((tvShow: TVShow) => ({ ...tvShow, contentType: 'tvshow' as const }))
      ];

      // Apply pagination
      const paginatedContent = allContent.slice(offset, offset + limit);
      const totalPages = Math.ceil(allContent.length / limit);

      const response: ApiResponse<PaginatedResponse<ContentItem>> = {
        success: true,
        data: {
          data: paginatedContent,
          pagination: {
            page,
            limit,
            total: allContent.length,
            totalPages
          }
        },
        message: 'Content retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content'
      });
    }
  }
}
