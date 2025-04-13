import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // パスワード確認チェック
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    // パスワード強度チェック（最低6文字）
    if (password.length < 6) {
      setErrorMessage('パスワードは6文字以上で設定してください');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      // 登録成功時は自動的にリダイレクトされるので何もしない
    } catch (error) {
      setErrorMessage((error as Error).message || 'アカウント登録に失敗しました');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">アカウント登録</h2>
        
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{errorMessage}</p>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            メールアドレス
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="email"
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            パスワード（6文字以上）
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            パスワード（確認）
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="confirmPassword"
            type="password"
            placeholder="******************"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <button
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : 'アカウント登録'}
          </button>
        </div>
        
        <div className="text-center text-sm">
          <a className="text-indigo-600 hover:text-indigo-800" href="/login">
            すでにアカウントをお持ちの方はこちら
          </a>
        </div>
      </form>
    </div>
  );
}; 