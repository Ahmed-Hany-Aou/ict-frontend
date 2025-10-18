// ict-frontend/src/services/authService.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// --- Interfaces for Type Safety ---

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
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // ✅ Check for access_token instead of token
      if (response.ok && result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Return normalized response
        return {
          success: true,
          message: result.message,
          access_token: result.access_token,
          user: result.user,
        };
      }
      
      // Handle error response
      return {
        success: false,
        message: result.message || 'Login failed',
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // ✅ Check for access_token instead of token
      if (response.ok && result.access_token) {
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
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get current user (requires token)
   */
  static async getUser(): Promise<UserResponse | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          user: result.user || result, // Handle both formats
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
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      return {
        success: response.ok,
        message: result.message || (response.ok ? 'Reset link sent' : 'Failed to send reset link'),
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
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