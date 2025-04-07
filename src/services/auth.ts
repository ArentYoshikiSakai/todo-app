import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export type Unsubscribe = () => void;

export interface AuthService {
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