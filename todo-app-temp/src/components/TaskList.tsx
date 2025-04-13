import React from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskItem from './TaskItem';

export const TaskList: React.FC = () => {
  const { tasks, loading, error, filter, setFilter } = useTasks();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p className="font-bold">エラー</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          未完了
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          完了済み
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">タスクがありません</p>
          <p className="text-sm mt-2">
            {filter === 'all' 
              ? '新しいタスクを追加してみましょう' 
              : filter === 'active'
                ? '未完了のタスクはありません'
                : '完了済みのタスクはありません'
            }
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList; 