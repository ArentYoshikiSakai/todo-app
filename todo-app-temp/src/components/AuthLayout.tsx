import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-800 mb-2">シンプルタスク管理</h1>
        <p className="text-gray-600">効率よく、シンプルに、タスクを管理しましょう</p>
      </div>
      
      <div className="w-full max-w-md">
        {children}
      </div>
      
      <div className="mt-8 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} シンプルタスク管理アプリ
      </div>
    </div>
  );
}; 