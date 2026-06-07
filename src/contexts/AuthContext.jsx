import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading to fetch initial session

  // Fetch current user details on boot if a token is stored
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
        } catch (error) {
          console.error('Session loading failed:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data?.error || error.message);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email, password, name) => {
    setIsLoading(true);
    try {
      // Temporarily save registration credentials to state.
      // The actual registration API call is deferred until the user selects a role.
      setPendingUser({ name, email, password });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error.message);
      setIsLoading(false);
      return false;
    }
  };

  const selectRole = async (role) => {
    if (!pendingUser) return false;
    setIsLoading(true);
    try {
      // Map frontend role roommate_seeker to tenant for backend compatibility
      const apiRole = role === 'roommate_seeker' ? 'tenant' : role;
      
      const data = await authAPI.register(
        pendingUser.name,
        pendingUser.email,
        pendingUser.password,
        apiRole
      );
      
      localStorage.setItem('token', data.token);
      // Retain the actual selected role in the frontend user state
      setUser({ ...data.user, role });
      setPendingUser(null);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Role selection / registration error:', error.response?.data?.error || error.message, error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPendingUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, selectRole, logout, pendingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
