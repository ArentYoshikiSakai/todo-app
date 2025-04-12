import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { registerUser, loginUser, logoutUser, resetPassword } from '../services/auth';

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
});

// カスタムフックを作成
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // クリーンアップ関数
    return unsubscribe;
  }, []);

  // ログイン処理
  const login = async (email: string, password: string): Promise<User> => {
    return await loginUser(email, password);
  };

  // ユーザー登録処理
  const register = async (email: string, password: string): Promise<User> => {
    return await registerUser(email, password);
  };

  // ログアウト処理
  const logout = async (): Promise<void> => {
    await logoutUser();
  };

  // パスワードリセット処理
  const resetPasswordFunc = async (email: string): Promise<void> => {
    await resetPassword(email);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword: resetPasswordFunc,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 