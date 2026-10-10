/**
 * Authentication Context & Hook
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mall_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mall_auth_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const { token: jwtToken, user: userData } = response.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('mall_auth_token', jwtToken);
        localStorage.setItem('mall_auth_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mall_auth_token');
    localStorage.removeItem('mall_auth_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
