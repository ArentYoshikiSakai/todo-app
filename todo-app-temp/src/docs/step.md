# 簡易タスク管理アプリケーション仕様書：API設計

## 11. API設計

SimpleTaskはFirebaseを活用したサーバーレスアプリケーションですが、フロントエンドとFirebaseサービス間の明確なAPIインターフェースを定義します。

### 11.1 認証API (Authentication Service)

```typescript
// src/services/auth.ts

interface AuthService {
  // ユーザー登録
  register(email: string, password: string): Promise<UserCredential>;
  
  // メール/パスワードでログイン
  login(email: string, password: string): Promise<UserCredential>;
  
  // ログアウト
  logout(): Promise<void>;
  
  // パスワードリセットメール送信
  resetPassword(email: string): Promise<void>;
  
  // 現在のユーザー取得
  getCurrentUser(): User | null;
  
  // 認証状態変更リスナー
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}
```

#### 実装例
```typescript
// 認証サービスの実装
export const authService: AuthService = {
  register: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  login: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  logout: () => {
    return signOut(auth);
  },
  
  resetPassword: (email) => {
    return sendPasswordResetEmail(auth, email);
  },
  
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};
```

### 11.2 タスクAPI (Task Service)

```typescript
// src/services/tasks.ts

interface TaskService {
  // タスク作成
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  
  // ユーザーのタスク一覧取得
  getTasks(userId: string, filter?: 'all' | 'completed' | 'active'): Promise<Task[]>;
  
  // 単一タスク取得
  getTask(taskId: string): Promise<Task | null>;
  
  // タスク更新
  updateTask(taskId: string, data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Promise<void>;
  
  // タスク削除
  deleteTask(taskId: string): Promise<void>;
  
  // タスク完了状態切り替え
  toggleTaskCompletion(taskId: string, completed: boolean): Promise<void>;
  
  // リアルタイムリスナー設定
  onTasksChanged(userId: string, callback: (tasks: Task[]) => void): Unsubscribe;
}
```

#### 実装例
```typescript
// タスクサービスの実装
export const taskService: TaskService = {
  createTask: async (task) => {
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');

    const taskData = {
      ...task,
      userId: user.uid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    return docRef.id;
  },
  
  getTasks: async (userId, filter = 'all') => {
    let q = query(
      collection(db, 'tasks'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (filter === 'completed') {
      q = query(q, where('completed', '==', true));
    } else if (filter === 'active') {
      q = query(q, where('completed', '==', false));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
  },
  
  getTask: async (taskId) => {
    const docRef = doc(db, 'tasks', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Task;
    }
    
    return null;
  },
  
  updateTask: async (taskId, data) => {
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');
    
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },
  
  deleteTask: async (taskId) => {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  },
  
  toggleTaskCompletion: async (taskId, completed) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      completed,
      updatedAt: serverTimestamp()
    });
  },
  
  onTasksChanged: (userId, callback) => {
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      
      callback(tasks);
    });
  }
};
```

### 11.3 カスタムフックAPI

これらのサービスをReactで使いやすくするためのカスタムフックを提供します。

#### 認証フック
```typescript
// src/hooks/useAuth.ts

import { useAuth } from '../contexts/AuthContext';
const { currentUser: user } = useAuth();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.register(email, password);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.login(email, password);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { user, loading, error, register, login, logout, resetPassword };
}
```

#### タスク管理フック
```typescript
// src/hooks/useTasks.ts

import { useAuth } from '../contexts/AuthContext';
const { currentUser: user } = useAuth();

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
      setError(err as Error);
      throw err;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      setError(null);
      await taskService.updateTask(taskId, data);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const toggleCompletion = async (taskId: string, completed: boolean) => {
    try {
      setError(null);
      await taskService.toggleTaskCompletion(taskId, completed);
    } catch (err) {
      setError(err as Error);
      throw err;
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
```

### 11.4 Firestore セキュリティルール

Firestoreのセキュリティルールを定義して、ユーザーが自分のタスクだけにアクセスできるようにします。

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // タスクコレクションのルール
    match /tasks/{taskId} {
      // 認証済みユーザーのみ
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
      
      // 自分のタスクのみ読み取り可能
      allow read: if request.auth != null && 
                  resource.data.userId == request.auth.uid;
      
      // 自分のタスクのみ更新可能
      allow update: if request.auth != null && 
                    resource.data.userId == request.auth.uid &&
                    request.resource.data.userId == request.auth.uid;
      
      // 自分のタスクのみ削除可能
      allow delete: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    // その他のコレクションはアクセス禁止
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 11.5 API使用例

コンポーネント内での使用例を示します：

#### タスク追加コンポーネント
```tsx
// src/components/tasks/TaskForm.tsx

import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';

export const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addTask, error } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      await addTask(title, description || undefined);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('タスク追加エラー:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-2">
        <textarea
          placeholder="詳細..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        追加
      </button>
      {error && <p className="text-red-500 mt-2">{error.message}</p>}
    </form>
  );
};
```

#### タスク一覧コンポーネント
```tsx
// src/components/tasks/TaskList.tsx

import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskItem } from './TaskItem';

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
```

この実装により、フロントエンドとFirebaseサービス間のAPIインターフェースが明確に定義され、型安全性が確保されるとともに、ビジネスロジックが整理された形でアプリケーションを構築できます。また、カスタムフックでReact Componentsからそれらのサービスが簡単に利用できる設計となっています。