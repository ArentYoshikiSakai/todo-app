import { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as authService from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      return await authService.registerUser(email, password);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      return await authService.loginUser(email, password);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  return { 
    user, 
    loading, 
    error, 
    register, 
    login, 
    logout, 
    resetPassword 
  };
} 