import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskContextType } from '../types';
import { taskService } from '../services/tasks';
import { useAuth } from './AuthContext.tsx';

// デフォルト値を持つコンテキストを作成
const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  addTask: async () => '',
  updateTask: async () => {},
  deleteTask: async () => {},
  toggleTaskCompletion: async () => {},
});

// カスタムフックを作成
export const useTask = () => useContext(TaskContext);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // ユーザーのタスクをロード
  useEffect(() => {
    let unsubscribe: () => void;

    const loadTasks = async () => {
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // リアルタイムリスナーを設定
        unsubscribe = taskService.onTasksChanged(currentUser.uid, (updatedTasks) => {
          setTasks(updatedTasks);
          setLoading(false);
        });
      } catch (error) {
        console.error('タスクロードエラー:', error);
        setLoading(false);
      }
    };

    loadTasks();

    // クリーンアップ関数
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // タスク追加
  const addTask = async (title: string, description?: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('認証が必要です');
    }

    const newTask = {
      userId: currentUser.uid,
      title,
      description,
      completed: false,
    };

    return await taskService.createTask(newTask);
  };

  // タスク更新
  const updateTask = async (
    taskId: string,
    data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    await taskService.updateTask(taskId, data);
  };

  // タスク削除
  const deleteTask = async (taskId: string): Promise<void> => {
    await taskService.deleteTask(taskId);
  };

  // タスク完了状態の切り替え
  const toggleTaskCompletion = async (taskId: string): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await taskService.toggleTaskCompletion(taskId, !task.completed);
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}; 