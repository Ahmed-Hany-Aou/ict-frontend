// ict-frontend/src/services/authService.ts

import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordData {
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  token_type?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  errors?: Record<string, string[]>;
}

interface UserResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

class AuthService {
  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', data);
      const result = response.data;

      if (response.status === 200 && result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        return {
          success: true,
          message: result.message,
          access_token: result.access_token,
          user: result.user,
        };
      }
      
      return {
        success: false,
        message: result.message || 'Login failed',
        errors: result.errors,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection error. Is the backend running?',
      };
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword,
    };

    try {
      const response = await api.post('/register', payload);
      const result = response.data;

      if (response.status === 200 && result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        return {
          success: true,
          message: result.message,
          access_token: result.access_token,
          user: result.user,
        };
      }

      return {
        success: false,
        message: result.message || 'Registration failed',
        errors: result.errors,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection error',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user (requires token)
   */
  static async getUser(): Promise<UserResponse | null> {
    try {
      const response = await api.get('/user');
      
      if (response.status === 200) {
        return {
          success: true,
          user: response.data.user || response.data,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    try {
      const response = await api.post('/forgot-password', data);
      
      return {
        success: response.status === 200,
        message: response.data.message || (response.status === 200 ? 'Reset link sent' : 'Failed to send reset link'),
        ...response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection error',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get stored user data
   */
  static getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get auth token
   */
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default AuthService;