import { useState, useEffect } from 'react';
import { Task } from '../types';
import { taskService } from '../services/tasks';
import { useAuth } from './useAuth';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsubscribe = taskService.onTasksChanged(user.uid, (newTasks) => {
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

    return () => unsubscribe();
  }, [user, filter]);

  const addTask = async (title: string, description?: string) => {
    try {
      if (!user) throw new Error('認証が必要です');
      setError(null);
      
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