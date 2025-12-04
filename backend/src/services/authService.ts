import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { FileStorage } from '../config/fileStorage';
import { AuthUser, LoginRequest, AuthResponse } from '../types';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  /**
   * Login user with username and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const users = await FileStorage.readFile<AuthUser>('auth-users.json');
      
      // Find user by username
      const user = users.find(u => u.username === credentials.username);
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // For demo purposes, we're doing plain text comparison
      // In production, use bcrypt.compare(credentials.password, user.password)
      const isValidPassword = credentials.password === user.password;
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email 
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      // Return user without password
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Verify JWT token and return user info
   */
  static async verifyToken(token: string): Promise<{ success: boolean; user?: Omit<AuthUser, 'password'>; message: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Get user from database
      const users = await FileStorage.readFile<AuthUser>('auth-users.json');
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        message: 'Token valid'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  static async getAllUsers(): Promise<Omit<AuthUser, 'password'>[]> {
    try {
      const users = await FileStorage.readFile<AuthUser>('auth-users.json');
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<AuthUser, 'password'> | null> {
    try {
      const users = await FileStorage.readFile<AuthUser>('auth-users.json');
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }
}
