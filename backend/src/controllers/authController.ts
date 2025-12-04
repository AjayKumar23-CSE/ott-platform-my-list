import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest } from '../types';

export class AuthController {
  /**
   * Login endpoint
   */
  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.username || !credentials.password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const result = await AuthService.login(credentials);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Login controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // User is already attached by auth middleware
      return res.status(200).json({
        success: true,
        data: req.user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify token endpoint
   */
  static async verifyToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const result = await AuthService.verifyToken(token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Verify token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all users (for demo purposes)
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AuthService.getAllUsers();
      
      return res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
