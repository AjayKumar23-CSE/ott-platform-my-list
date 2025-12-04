import axios from 'axios';
import { LoginRequest, AuthResponse, AuthUser } from '../types';
import { setAuthHeader } from './api';

const API_BASE_URL = '/api/auth';

// Create axios instance for auth
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/login', credentials);
      const authResponse: AuthResponse = response.data;
      
      if (authResponse.success && authResponse.token && authResponse.user) {
        // Store token and user in localStorage
        localStorage.setItem(TOKEN_KEY, authResponse.token);
        localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
        
        // Set default authorization header
        this.setAuthHeader(authResponse.token);
      }
      
      return authResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete authApi.defaults.headers.common['Authorization'];
    // Also clear from main API instance
    setAuthHeader('');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  // Set authorization header
  setAuthHeader(token: string): void {
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Also set it on the main API instance
    setAuthHeader(token);
  },

  // Initialize auth (call on app startup)
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  },

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await authApi.post('/verify-token', { token });
      return response.data.success;
    } catch (error) {
      this.logout(); // Clear invalid token
      return false;
    }
  },

  // Get user profile
  async getProfile(): Promise<AuthUser | null> {
    try {
      const response = await authApi.get('/profile');
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

// Initialize auth on module load
authService.initializeAuth();
