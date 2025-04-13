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

    console.log('Firestoreにタスクを作成:', task);

    const taskData = {
      ...task,
      userId: user.uid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('タスク作成成功:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('タスク作成エラー:', error);
      throw error;
    }
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
    console.log('タスク変更リスナーを設定:', userId);
    
    try {
      // インデックスエラーを回避するため、単純なクエリに変更
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      return onSnapshot(q, (snapshot) => {
        console.log('Firestoreからの更新:', snapshot.docs.length, '件のタスク');
        
        const tasks = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('タスクデータ:', doc.id, data);
          
          // タイムスタンプのチェックと変換
          let createdAt = data.createdAt;
          let updatedAt = data.updatedAt;
          
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate();
          } else if (!createdAt) {
            createdAt = new Date();
          }
          
          if (updatedAt && typeof updatedAt.toDate === 'function') {
            updatedAt = updatedAt.toDate();
          } else if (!updatedAt) {
            updatedAt = new Date();
          }
          
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title || '',
            description: data.description || '',
            completed: Boolean(data.completed),
            createdAt,
            updatedAt
          } as Task;
        });
        
        // クライアント側でソート
        const sortedTasks = tasks.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        callback(sortedTasks);
      }, (error) => {
        console.error('タスク監視エラー:', error);
      });
    } catch (error) {
      console.error('リスナー設定エラー:', error);
      // エラー時にはダミーのunsubscribe関数を返す
      return () => {};
    }
  }
};

export default taskService; 