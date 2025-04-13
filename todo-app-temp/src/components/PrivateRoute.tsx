import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // 認証状態がロード中の場合はローディング表示
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 認証されていない場合はログインページにリダイレクト
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}; 