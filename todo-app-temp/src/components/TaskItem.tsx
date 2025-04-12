import React from 'react';
import { Task } from '../types';
import { useTask } from '../contexts/TaskContext';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask } = useTask();

  const handleToggleComplete = async () => {
    try {
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('タスク更新エラー:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('タスク削除エラー:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-white rounded shadow">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="w-5 h-5 mr-3"
        />
        <div>
          <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm text-gray-600 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400">
            作成日: {task.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
      >
        削除
      </button>
    </div>
  );
};

export default TaskItem; 