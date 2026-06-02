'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { getToken, setToken, clearAuth } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.get('/auth/me');
        setUser(userData); // Includes role + permissions from server
      } catch (error) {
        console.error('Failed to authenticate token:', error.message);
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });

      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        permissions: data.permissions,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { username, email, password });

      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        permissions: data.permissions,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  /**
   * Check if the current user has a specific permission.
   * masterAdmin always returns true.
   * @param {'read'|'create'|'update'|'delete'} permission
   */
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'masterAdmin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  const isMasterAdmin = user?.role === 'masterAdmin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission, isMasterAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
