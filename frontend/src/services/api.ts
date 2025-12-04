import axios from 'axios';
import { MyListItem, PaginatedResponse, ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Function to manually set auth header (call after login)
export const setAuthHeader = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const myListApi = {
  // Get user's My List with pagination
  getMyList: async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<MyListItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<MyListItem>>>(
      `/my-list/${userId}?page=${page}&limit=${limit}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch My List');
    }
    
    return response.data.data!;
  },

  // Add item to My List
  addToMyList: async (
    userId: string,
    contentId: string,
    contentType: 'movie' | 'tvshow'
  ): Promise<MyListItem> => {
    const response = await api.post<ApiResponse<MyListItem>>(
      `/my-list/${userId}/add`,
      { contentId, contentType }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to add to My List');
    }
    
    return response.data.data!;
  },

  // Remove item from My List
  removeFromMyList: async (
    userId: string,
    contentId: string,
    contentType: 'movie' | 'tvshow'
  ): Promise<void> => {
    const response = await api.delete<ApiResponse>(
      `/my-list/${userId}/remove`,
      { data: { contentId, contentType } }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove from My List');
    }
  },
};

export const apiClient = api;
export default api;
