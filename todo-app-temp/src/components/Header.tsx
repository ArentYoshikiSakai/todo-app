import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // ログアウト後は自動的にリダイレクトされるので何もしない
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">シンプルタスク管理</Link>
        
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div className="space-x-2">
            <Link
              to="/login"
              className="text-white hover:text-indigo-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              登録
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}; 