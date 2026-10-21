import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('elevai_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = localStorage.getItem('elevai_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getMeApi();
        if (isMounted && data.success && data.user) {
          setUser(data.user);
        } else if (isMounted) {
          localStorage.removeItem('elevai_token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          localStorage.removeItem('elevai_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    if (data.success && data.token) {
      localStorage.setItem('elevai_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    if (data.success && data.token) {
      localStorage.setItem('elevai_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Ignore API failure during logout
    } finally {
      localStorage.removeItem('elevai_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
