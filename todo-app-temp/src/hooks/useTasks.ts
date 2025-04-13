import { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { taskService } from '../services/tasks';
import { useAuth } from '../contexts/AuthContext';

export function useTasks() {
  const { currentUser: user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  // リスナーの参照を保持するRef
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log('現在のユーザーID:', user.uid);
    
    // 前のリスナーがあればクリーンアップ
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    const unsubscribe = taskService.onTasksChanged(user.uid, (newTasks) => {
      console.log('取得したタスク:', newTasks);
      
      // フィルタリングをクライアント側で行う
      let filteredTasks = newTasks;
      if (filter === 'completed') {
        filteredTasks = newTasks.filter(task => task.completed);
      } else if (filter === 'active') {
        filteredTasks = newTasks.filter(task => !task.completed);
      }

      setTasks(filteredTasks);
      setLoading(false);
    });

    // リスナーの参照を保存
    unsubscribeRef.current = unsubscribe;

    // クリーンアップ関数
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, filter]);

  const addTask = async (title: string, description?: string) => {
    try {
      if (!user) throw new Error('認証が必要です');
      setError(null);
      
      console.log('タスク追加:', { title, description, userId: user.uid });
      
      await taskService.createTask({
        title,
        description,
        userId: user.uid,
        completed: false
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      setError(null);
      await taskService.updateTask(taskId, data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      await taskService.deleteTask(taskId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const toggleCompletion = async (taskId: string, completed: boolean) => {
    try {
      setError(null);
      await taskService.toggleTaskCompletion(taskId, completed);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    filter,
    setFilter,
    addTask,
    updateTask,
    deleteTask,
    toggleCompletion
  };
} 