import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, CheckCircle, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthService from './services/authService';

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

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;
type AuthPage = 'login' | 'register' | 'forgot';

export default function AuthPages() {
  const { setUser } = useAuth();  // Get setUser function
  const navigate = useNavigate();  // Get navigate function

  const [currentPage, setCurrentPage] = useState<AuthPage>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [globalError, setGlobalError] = useState<string>('');
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    } as unknown as FormData));

    if ((errors as any)[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear global error when user starts typing
    if (globalError) {
      setGlobalError('');
    }
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (currentPage === 'register') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const validateForgotEmail = (): boolean => {
    if (!forgotEmail.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ email: 'Invalid email format' });
      return false;
    }
    return true;
  };

  const toggleAuth = (page: AuthPage) => {
    setCurrentPage(page);
    setErrors({});
    setGlobalError('');
    setShowPassword(false);
    setLoading(false);
    setSuccess(false);
    setSuccessMessage('');
    setShowSuccessBanner(false);
    setForgotEmail('');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    });
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);
  setGlobalError(''); // Clear any previous errors

  try {
    let response: AuthResponse;

    if (currentPage === 'login') {
      response = await AuthService.login({
        email: formData.email,
        password: formData.password,
      });
    } else {
      response = await AuthService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    }

    if (response.success) {
      // Set success message
      setSuccessMessage(
        response.message || (currentPage === 'login' ? 'Welcome Back!' : 'Account Created Successfully!')
      );
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);

        if (currentPage === 'login') {
          // Login: Update user in context and navigate to dashboard
          if (response.user) {
            setUser(response.user);
          }
          navigate('/');
        } else {
          // Register: Redirect to login page and show success message
          setCurrentPage('login');
          setShowSuccessBanner(true);
          setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false,
          });
          // Clear success banner after 5 seconds
          setTimeout(() => {
            setShowSuccessBanner(false);
          }, 5000);
        }
      }, 3500);
    } else {
      // Handle errors from backend - display friendly messages
      if (response.errors) {
        const newErrors: Errors = {};
        for (const [field, messages] of Object.entries(response.errors)) {
          newErrors[field as keyof FormData] = (messages as string[])[0];
        }
        setErrors(newErrors);
        // Set global error for display at top
        if (response.message) {
          setGlobalError(response.message);
        }
      } else if (response.message) {
        // Display the friendly error message from backend
        setGlobalError(response.message);
      } else {
        setGlobalError('Authentication failed. Please try again.');
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    setGlobalError('Connection error. Is the backend running?');
  } finally {
    setLoading(false);
  }
};

const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateForgotEmail()) return;

  setLoading(true);

  try {
    const response = await AuthService.forgotPassword({
      email: forgotEmail,
    });

    if (response.success) {
      setSuccessMessage('Password reset link sent to your email!');
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForgotEmail('');
        setCurrentPage('login');
      }, 3000);
    } else {
      setErrors({ email: response.message || 'Error sending reset link' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    setErrors({ email: 'Connection error' });
  } finally {
    setLoading(false);
  }
};
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary-color: #23395d;
      --primary-dark: #1a2b47;
      --secondary-color: #17417a;
      --accent-color: #4a90e2;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --text-dark: #212529;
      --text-light: #6c757d;
      --bg-white: #ffffff;
      --border-radius: 12px;
      --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      --box-shadow-hover: 0 4px 20px rgba(0, 0, 0, 0.12);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        transform: translateX(-30px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes checkmark {
      0% {
        transform: scale(0) rotate(-45deg);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1) rotate(0);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    }

    .auth-container {
      width: 100%;
      max-width: 420px;
      background: var(--bg-white);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow-hover);
      overflow: hidden;
      animation: slideInScale 0.6s ease-out;
    }

    .auth-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: white;
      padding: 2.5rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .auth-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .auth-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 250px;
      height: 250px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }

    .auth-header-top {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: var(--transition);
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .auth-header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .auth-icon {
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }

    .auth-title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(45deg, #fff, #a8d8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeInUp 0.6s ease-out 0.1s both;
      margin: 0;
    }

    .auth-subtitle {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
      animation: fadeInUp 0.6s ease-out 0.3s both;
      margin: 0;
    }

    .auth-form {
      padding: 2.5rem 2rem;
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }

    .form-group {
      margin-bottom: 1.5rem;
      animation: slideInLeft 0.5s ease-out;
    }

    .form-group:nth-child(1) { animation-delay: 0.1s; }
    .form-group:nth-child(2) { animation-delay: 0.15s; }
    .form-group:nth-child(3) { animation-delay: 0.2s; }
    .form-group:nth-child(4) { animation-delay: 0.25s; }
    .form-group:nth-child(5) { animation-delay: 0.3s; }

    .form-label {
      display: block;
      margin-bottom: 0.6rem;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 0.95rem;
      letter-spacing: 0.3px;
    }

    .form-description {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      padding: 0.9rem 1rem 0.9rem 2.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: var(--transition);
      font-family: inherit;
      background: #f8f9fa;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-color);
      background: white;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .form-input.error {
      border-color: var(--danger-color);
      background: #fff5f5;
    }

    .form-input:disabled {
      opacity: 0.6;
    }

    .input-icon {
      position: absolute;
      left: 0.75rem;
      color: var(--text-light);
      pointer-events: none;
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      transition: var(--transition);
    }

    .toggle-password:hover {
      color: var(--accent-color);
    }

    .toggle-password:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: var(--danger-color);
      font-size: 0.85rem;
      margin-top: 0.4rem;
      animation: slideInLeft 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 500;
    }

    .alert-banner {
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideInLeft 0.4s ease-out;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .alert-error {
      background: linear-gradient(135deg, #fff5f5 0%, #fee 100%);
      border: 2px solid #fecaca;
      color: #991b1b;
    }

    .alert-success {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #86efac;
      color: #166534;
    }

    .alert-info {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 2px solid #93c5fd;
      color: #1e40af;
    }

    .alert-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-message {
      font-size: 0.9rem;
      opacity: 0.95;
    }

    .alert-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      transition: var(--transition);
      opacity: 0.7;
    }

    .alert-close:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--accent-color);
    }

    .checkbox-label {
      cursor: pointer;
      color: var(--text-dark);
      font-size: 0.95rem;
      user-select: none;
      transition: var(--transition);
    }

    .checkbox-label:hover {
      color: var(--accent-color);
    }

    .forgot-password {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
      margin-left: auto;
      font-size: 0.95rem;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
    }

    .forgot-password:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }

    .auth-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
      color: white;
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
      transition: var(--transition);
      letter-spacing: 0.5px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeInUp 0.3s ease-out;
    }

    .success-box {
      background: white;
      padding: 3rem;
      border-radius: var(--border-radius);
      text-align: center;
      animation: slideInScale 0.4s ease-out;
      box-shadow: var(--box-shadow-hover);
    }

    .success-checkmark {
      width: 60px;
      height: 60px;
      background: var(--success-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      animation: checkmark 0.6s ease-out;
      color: white;
    }

    .success-text {
      color: var(--text-dark);
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .success-subtext {
      color: var(--text-light);
      font-size: 0.95rem;
    }

    .auth-footer {
      text-align: center;
      padding: 1.5rem 2rem;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .auth-footer p {
      color: var(--text-dark);
      font-size: 0.95rem;
      margin: 0;
    }

    .toggle-link {
      color: var(--accent-color);
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition);
    }

    .toggle-link:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-container {
        margin: 1rem;
      }

      .auth-header {
        padding: 2rem 1.5rem;
      }

      .auth-title {
        font-size: 1.6rem;
      }

      .auth-form {
        padding: 2rem 1.5rem;
      }

      .form-input {
        padding: 0.8rem 0.8rem 0.8rem 2.2rem;
        font-size: 16px;
      }
    }
  `;

  return (
    <div className="auth-wrapper">
      <style>{styles}</style>

      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-header-top">
            <div></div>
            <div className="auth-header-content">
              <BookOpen className="auth-icon" size={35} />
              <div>
                <div className="auth-title">WADHA?! Platform</div>
              </div>
            </div>
            {currentPage === 'forgot' && (
              <button
                className="back-btn"
                onClick={() => toggleAuth('login')}
                type="button"
                aria-label="Back to login"
              >
                <ArrowLeft size={18} />
              </button>
            )}
          </div>
          <div className="auth-subtitle">
            {currentPage === 'login' && 'Welcome Back to Your Learning Journey'}
            {currentPage === 'register' && 'Begin Your Digital Learning Adventure'}
            {currentPage === 'forgot' && 'Reset Your Password'}
          </div>
        </div>

        {/* Login Form */}
        {currentPage === 'login' && (
          <form onSubmit={handleSubmit} className="auth-form">
            {showSuccessBanner && (
              <div className="alert-banner alert-success">
                <div className="alert-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-title">Registration Successful!</div>
                  <div className="alert-message">
                    {successMessage || 'Your account has been created. Please log in to continue.'}
                  </div>
                </div>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setShowSuccessBanner(false)}
                  aria-label="Close alert"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {globalError && (
              <div className="alert-banner alert-error">
                <div className="alert-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-title">Login Failed</div>
                  <div className="alert-message">{globalError}</div>
                </div>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setGlobalError('')}
                  aria-label="Close alert"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {errors.email && <div className="error-message">⚠️ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">🔐 Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="error-message">⚠️ {errors.password}</div>}
            </div>

            <div className="auth-options">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="checkbox-input"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => toggleAuth('forgot')}
              >
                Forgot password?
              </button>
            </div>

            <button className="submit-btn" disabled={loading} type="submit">
              <div className="btn-content">
                {loading && <div className="spinner" />}
                <span>{loading ? 'Processing...' : 'Sign In'}</span>
              </div>
            </button>
          </form>
        )}

        {/* Register Form */}
        {currentPage === 'register' && (
          <form onSubmit={handleSubmit} className="auth-form">
            {globalError && (
              <div className="alert-banner alert-error">
                <div className="alert-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-title">Registration Failed</div>
                  <div className="alert-message">{globalError}</div>
                </div>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setGlobalError('')}
                  aria-label="Close alert"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">📚 Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {errors.fullName && <div className="error-message">⚠️ {errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {errors.email && <div className="error-message">⚠️ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">🔐 Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="error-message">⚠️ {errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">✓ Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <div className="error-message">⚠️ {errors.confirmPassword}</div>
              )}
            </div>

            <button className="submit-btn" disabled={loading} type="submit">
              <div className="btn-content">
                {loading && <div className="spinner" />}
                <span>{loading ? 'Processing...' : 'Create Account'}</span>
              </div>
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {currentPage === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            {globalError && (
              <div className="alert-banner alert-error">
                <div className="alert-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-title">Error</div>
                  <div className="alert-message">{globalError}</div>
                </div>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setGlobalError('')}
                  aria-label="Close alert"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <p className="form-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  disabled={loading}
                />
              </div>
              {errors.email && <div className="error-message">⚠️ {errors.email}</div>}
            </div>

            <button className="submit-btn" disabled={loading} type="submit">
              <div className="btn-content">
                {loading && <div className="spinner" />}
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </div>
            </button>
          </form>
        )}

        {/* Footer */}
        {currentPage !== 'forgot' && (
          <div className="auth-footer">
            <p>
              {currentPage === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <span
                className="toggle-link"
                onClick={() => toggleAuth(currentPage === 'login' ? 'register' : 'login')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAuth(currentPage === 'login' ? 'register' : 'login');
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {currentPage === 'login' ? 'Sign up here' : 'Sign in here'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Success Overlay */}
      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-checkmark">
              <CheckCircle size={40} />
            </div>
            <div className="success-text">{successMessage}</div>
            <div className="success-subtext">
              {currentPage === 'login' && 'You have successfully signed in.'}
              {currentPage === 'register' && 'Your account is ready. Welcome to ICT Interactive!'}
              {currentPage === 'forgot' && 'Check your email for the reset link.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}