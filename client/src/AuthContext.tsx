import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'));

  // Load user theme on initialization
  useEffect(() => {
    if (token) {
      loadUserTheme();
    }
  }, [token]);

  const loadUserTheme = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const profile = await response.json();
        if (profile.backgroundColor && profile.accentColor) {
          document.documentElement.style.setProperty('--background-color', profile.backgroundColor);
          document.documentElement.style.setProperty('--accent-color', profile.accentColor);
        }
      }
    } catch (error) {
      console.error('Error loading user theme:', error);
    }
  };

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    if (user) localStorage.setItem('user', user);
    else localStorage.removeItem('user');
  }, [token, user]);

  const login = async (username: string, password: string) => {
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(username);
      // Load theme after login
      setTimeout(() => loadUserTheme(), 100);
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string) => {
    const res = await fetch('http://localhost:4000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(username);
      // Load theme after registration
      setTimeout(() => loadUserTheme(), 100);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset to default theme
    document.documentElement.style.setProperty('--background-color', '#111111');
    document.documentElement.style.setProperty('--accent-color', '#A084E8');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 