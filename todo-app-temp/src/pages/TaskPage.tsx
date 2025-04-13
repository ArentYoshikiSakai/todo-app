import React from 'react';
import { Header } from '../components/Header';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export const TaskPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
            <div className="bg-indigo-600 py-4 px-6">
              <h2 className="text-white font-medium">新しいタスク</h2>
            </div>
            <div className="p-6">
              <TaskForm />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 py-4 px-6">
              <h2 className="text-white font-medium">タスク一覧</h2>
            </div>
            <div className="p-6">
              <TaskList />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} シンプルタスク管理アプリ
      </footer>
    </div>
  );
}; 