import { Request, Response } from 'express';
import { MyListService } from '../services/myListService';
import { ApiResponse } from '../types';

export class MyListController {
  /**
   * Add item to My List
   */
  static async addToMyList(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { contentId, contentType } = req.body;

      const myListItem = await MyListService.addToMyList(userId, contentId, contentType);

      const response: ApiResponse = {
        success: true,
        data: myListItem,
        message: `${contentType} added to your list successfully`
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to list'
      };

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json(response);
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  }

  /**
   * Remove item from My List
   */
  static async removeFromMyList(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { contentId, contentType } = req.body;

      await MyListService.removeFromMyList(userId, contentId, contentType);

      const response: ApiResponse = {
        success: true,
        message: `${contentType} removed from your list successfully`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from list'
      };

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  }

  /**
   * Get user's My List with pagination
   */
  static async getMyList(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await MyListService.getMyList(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'My list retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve list'
      };

      res.status(500).json(response);
    }
  }
}
