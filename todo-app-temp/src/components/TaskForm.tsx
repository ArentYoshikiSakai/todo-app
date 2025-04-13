import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';

export const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addTask, error } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      await addTask(title, description || undefined);
      setTitle('');
      setDescription('');
      
      // 成功メッセージを表示して3秒後に消す
      setSuccessMessage('タスクを追加しました');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('タスク追加エラー:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          required
        />
      </div>
      <div className="mb-4">
        <textarea
          placeholder="詳細を入力（任意）..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          rows={3}
        />
      </div>
      <button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
      >
        タスクを追加
      </button>
      {error && <p className="mt-3 text-red-500 text-sm">{error.message}</p>}
    </form>
  );
}; 