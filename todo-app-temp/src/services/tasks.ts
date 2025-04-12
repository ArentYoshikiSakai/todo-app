import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  doc, 
  orderBy,
  serverTimestamp, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Task } from '../types';

// TaskServiceインターフェース
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
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        completed: data.completed,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Task;
    });
  },
  
  getTask: async (taskId) => {
    const docRef = doc(db, 'tasks', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        userId: data.userId,
        title: data.title,
        description: data.description,
        completed: data.completed,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Task;
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
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          completed: data.completed,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Task;
      });
      
      callback(tasks);
    });
  }
};

export default taskService; 