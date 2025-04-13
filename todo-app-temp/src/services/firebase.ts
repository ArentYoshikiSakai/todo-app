import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebaseの構成オブジェクト
// 実際の値は環境変数またはFirebaseコンソールからコピーして使用します
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 開発環境の場合にはデバッグ情報を出力
if (import.meta.env.DEV) {
  console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 5) + '...',
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId?.substring(0, 8) + '...',
  });
}

// Firebaseの初期化
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 開発環境でエミュレーターを使用する場合はコメントを外す
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// } 