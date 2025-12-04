import { FileStorage } from '../config/fileStorage';
import { cache } from '../config/cache';
import { MyListItem, PaginatedResponse, Movie, TVShow } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FileMyListItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tvshow';
  addedAt: string;
}

export class MyListService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'mylist:';

  /**
   * Add item to user's list
   */
  static async addToMyList(userId: string, contentId: string, contentType: 'movie' | 'tvshow'): Promise<MyListItem> {
    // Check if content exists
    const contentExists = await this.validateContent(contentId, contentType);
    if (!contentExists) {
      throw new Error(`${contentType} with id ${contentId} not found`);
    }

    // Check for duplicates
    const existingItems = await FileStorage.findInFile<FileMyListItem>(
      'mylist.json',
      item => item.userId === userId && item.contentId === contentId && item.contentType === contentType
    );

    if (existingItems.length > 0) {
      throw new Error('Item already exists in your list');
    }

    const myListItem: FileMyListItem = {
      id: uuidv4(),
      userId,
      contentId,
      contentType,
      addedAt: new Date().toISOString()
    };

    await FileStorage.appendToFile('mylist.json', myListItem);

    // Invalidate cache
    this.invalidateUserCache(userId);

    return {
      ...myListItem,
      addedAt: new Date(myListItem.addedAt)
    };
  }

  /**
   * Remove item from user's list
   */
  static async removeFromMyList(userId: string, contentId: string, contentType: 'movie' | 'tvshow'): Promise<boolean> {
    const allItems = await FileStorage.readFile<FileMyListItem>('mylist.json');
    const itemToRemove = allItems.find(
      item => item.userId === userId && item.contentId === contentId && item.contentType === contentType
    );

    if (!itemToRemove) {
      throw new Error('Item not found in your list');
    }

    const filteredItems = allItems.filter(
      item => !(item.userId === userId && item.contentId === contentId && item.contentType === contentType)
    );

    await FileStorage.writeFile('mylist.json', filteredItems);

    // Invalidate cache
    this.invalidateUserCache(userId);

    return true;
  }

  /**
   * Get user's list with pagination and content details
   */
  static async getMyList(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedResponse<MyListItem & { content: Movie | TVShow }>> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}:${page}:${limit}`;
    
    // Try to get from cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get user's list items
    const userItems = await FileStorage.findInFile<FileMyListItem>(
      'mylist.json',
      item => item.userId === userId
    );

    // Sort by addedAt descending
    userItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    // Calculate pagination
    const total = userItems.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = userItems.slice(offset, offset + limit);

    // Get content details for each item
    const data = await Promise.all(
      paginatedItems.map(async (item) => {
        const content = await this.getContentDetails(item.contentId, item.contentType);
        return {
          id: item.id,
          userId: item.userId,
          contentId: item.contentId,
          contentType: item.contentType,
          addedAt: new Date(item.addedAt),
          content
        };
      })
    );

    const response: PaginatedResponse<MyListItem & { content: Movie | TVShow }> = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    // Cache the result
    cache.set(cacheKey, response, this.CACHE_TTL);

    return response;
  }

  /**
   * Get content details by ID and type
   */
  private static async getContentDetails(contentId: string, contentType: 'movie' | 'tvshow'): Promise<Movie | TVShow> {
    if (contentType === 'movie') {
      const movies = await FileStorage.readFile<Movie>('movies.json');
      const movie = movies.find(m => m.id === contentId);
      if (!movie) {
        throw new Error(`Movie with id ${contentId} not found`);
      }
      return {
        ...movie,
        releaseDate: new Date(movie.releaseDate)
      };
    } else {
      const tvShows = await FileStorage.readFile<TVShow>('tvshows.json');
      const tvShow = tvShows.find(tv => tv.id === contentId);
      if (!tvShow) {
        throw new Error(`TV Show with id ${contentId} not found`);
      }
      return {
        ...tvShow,
        episodes: tvShow.episodes.map(ep => ({
          ...ep,
          releaseDate: new Date(ep.releaseDate)
        }))
      };
    }
  }

  /**
   * Check if content exists in database
   */
  private static async validateContent(contentId: string, contentType: 'movie' | 'tvshow'): Promise<boolean> {
    try {
      await this.getContentDetails(contentId, contentType);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Invalidate user's cache
   */
  private static invalidateUserCache(userId: string): void {
    const pattern = `${this.CACHE_PREFIX}${userId}:*`;
    cache.deletePattern(pattern);
  }
}
