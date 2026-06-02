import React, { createContext, useContext, useState } from 'react';
import { mockUsers } from '@/data/mockData';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setUser(existingUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (email, password, name) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    setPendingUser({ id: Date.now().toString(), email, name, verified: false, createdAt: new Date() });
    setIsLoading(false);
    return true;
  };

  const selectRole = (role) => {
    if (pendingUser) {
      setUser({ ...pendingUser, role });
      setPendingUser(null);
    }
  };

  const logout = () => {
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
