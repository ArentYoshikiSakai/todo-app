import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '../types';

// ユーザー登録
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email as string,
    };
  } catch (error) {
    if ((error as any).code === 'auth/email-already-in-use') {
      throw new Error('このメールアドレスはすでに使用されています');
    }
    throw error;
  }
};

// ログイン
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email as string,
    };
  } catch (error) {
    if ((error as any).code === 'auth/user-not-found' || (error as any).code === 'auth/wrong-password') {
      throw new Error('メールアドレスまたはパスワードが間違っています');
    }
    throw error;
  }
};

// ログアウト
export const logoutUser = async (): Promise<void> => {
  return await signOut(auth);
};

// パスワードリセットメール送信
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if ((error as any).code === 'auth/user-not-found') {
      throw new Error('このメールアドレスのユーザーは登録されていません');
    }
    throw error;
  }
}; 