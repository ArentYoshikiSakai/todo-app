import React from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleCompletion, deleteTask } = useTasks();

  const handleToggleComplete = async () => {
    try {
      console.log('タスク状態切り替え:', task.id, !task.completed);
      await toggleCompletion(task.id, !task.completed);
    } catch (error) {
      console.error('タスク更新エラー:', error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log('タスク削除:', task.id);
      await deleteTask(task.id);
    } catch (error) {
      console.error('タスク削除エラー:', error);
    }
  };

  // Dateオブジェクトかどうかをチェックしてからフォーマット
  const formatDate = (date: Date | any) => {
    if (!date) return '日付なし';
    
    try {
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('ja-JP');
      }
      if (date instanceof Date) {
        return date.toLocaleDateString('ja-JP');
      }
      return '不明な日付形式';
    } catch (error) {
      console.error('日付フォーマットエラー:', error, date);
      return '日付エラー';
    }
  };

  return (
    <li className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 pt-1">
          <button 
            onClick={handleToggleComplete}
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            style={{ borderColor: task.completed ? '#4f46e5' : '#d1d5db', backgroundColor: task.completed ? '#4f46e5' : 'transparent' }}
          >
            {task.completed && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            作成日: {formatDate(task.createdAt)}
          </p>
        </div>
        
        <button
          onClick={handleDelete}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="タスクを削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </li>
  );
};

export default TaskItem; 