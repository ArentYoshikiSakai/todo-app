import React from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskItem from './TaskItem';

export const TaskList: React.FC = () => {
  const { tasks, loading, error, filter, setFilter } = useTasks();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button 
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          すべて
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          未完了
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          完了済み
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>タスクがありません</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList; 