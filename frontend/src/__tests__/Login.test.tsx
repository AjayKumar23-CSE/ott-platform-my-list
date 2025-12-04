import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';
import { authService } from '../services/authService';

// Mock the authService
jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Login Component', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('OTT Platform')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your My List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders demo user buttons', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Movie Buff')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('fills form when demo user button is clicked', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const johnDoeButton = screen.getByText('John Doe');
    fireEvent.click(johnDoeButton);
    
    const usernameInput = screen.getByPlaceholderText('Enter your username') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    
    expect(usernameInput.value).toBe('john_doe');
    expect(passwordInput.value).toBe('password123');
  });

  it('toggles password visibility', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: 'test-user',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2025-01-01T00:00:00.000Z'
    };

    mockAuthService.login.mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: mockUser,
      message: 'Login successful'
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('handles login failure', async () => {
    mockAuthService.login.mockResolvedValue({
      success: false,
      message: 'Invalid credentials'
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });
  });

  it('shows loading state during login', async () => {
    mockAuthService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('requires username and password', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Form validation should prevent submission
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
