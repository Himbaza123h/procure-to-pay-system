import { authAPI } from './api';

// services/auth.js
export const login = async (username, password) => {
  try {
    const response = await fetch('https://procure-backend.onrender.com/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Successful login (status 200)
      return {
        success: true,
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      };
    } else {
      // Failed login (status 401 or other error)
      return {
        success: false,
        error: data.detail || 'Login failed',
      };
    }
  } catch (error) {
    // Network or other errors
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Helper function to decode JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};