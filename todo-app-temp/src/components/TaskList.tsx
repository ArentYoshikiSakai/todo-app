import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import TaskItem from './TaskItem';

type FilterType = 'all' | 'active' | 'completed';

const TaskList: React.FC = () => {
  const { tasks, loading, addTask } = useTask();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      try {
        await addTask(newTaskTitle, newTaskDescription || undefined);
        setNewTaskTitle('');
        setNewTaskDescription('');
      } catch (error) {
        console.error('タスク追加エラー:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleAddTask} className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">新しいタスクを追加</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            タイトル（必須）
          </label>
          <input
            type="text"
            id="title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="タスク名を入力"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            説明（任意）
          </label>
          <textarea
            id="description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="詳細を入力"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          タスクを追加
        </button>
      </form>

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'active' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          未完了
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'completed' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          完了済み
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4">読み込み中...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {activeFilter === 'all' 
              ? 'タスクがありません。' 
              : activeFilter === 'active' 
                ? '未完了のタスクがありません。' 
                : '完了済みのタスクがありません。'}
          </div>
        ) : (
          filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default TaskList; 