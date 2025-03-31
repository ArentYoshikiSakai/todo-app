// ユーザー型定義
export interface User {
  uid: string;
  email: string;
}

// タスク型定義
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 認証コンテキスト用の型定義
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// タスクコンテキスト用の型定義
export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (title: string, description?: string) => Promise<string>;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
} 