# SimpleTask API設計書

## 認証API

| 操作 | 概要 | 主要パラメータ（型、必須） | リクエストボディスキーマ | レスポンスコード（概要、スキーマ） | 暗黙的な要件 |
|------|------|--------------------------|----------------------|--------------------------------|------------|
| POST /auth/register | ユーザー登録 | なし | { "email": string, "password": string } | 201 (登録成功, { "uid": string, "email": string }) <br> 400 (無効なリクエスト) <br> 409 (メールアドレス既存) | パスワードは8文字以上、メールアドレスは有効な形式である必要がある |
| POST /auth/login | ログイン | なし | { "email": string, "password": string } | 200 (ログイン成功, { "uid": string, "token": string }) <br> 401 (認証失敗) | 成功するとレスポンスにはアクセストークンが含まれる |
| POST /auth/logout | ログアウト | なし | なし | 200 (ログアウト成功) | 有効な認証トークンがヘッダーに必要 |
| POST /auth/reset-password | パスワードリセット | なし | { "email": string } | 200 (リセットメール送信成功) <br> 404 (ユーザー未登録) | 登録済みのメールアドレスにリセットリンクが送信される |

## タスクAPI

| 操作 | 概要 | 主要パラメータ（型、必須） | リクエストボディスキーマ | レスポンスコード（概要、スキーマ） | 暗黙的な要件 |
|------|------|--------------------------|----------------------|--------------------------------|------------|
| GET /tasks | ユーザーのタスク一覧取得 | filter (string, false) <br> - 'all' <br> - 'completed' <br> - 'active' | なし | 200 (タスク一覧, [{ "id": string, "title": string, "description": string, "completed": boolean, "createdAt": timestamp, "updatedAt": timestamp }]) | 認証されたユーザーのタスクのみ返される。filterパラメータのデフォルトは'all' |
| POST /tasks | 新規タスク作成 | なし | { "title": string, "description": string (optional) } | 201 (タスク作成成功, { "id": string }) <br> 400 (無効なリクエスト) | 認証済みのユーザーのみタスク作成可能。titleは必須。createdAtとupdatedAtは自動設定される |
| GET /tasks/{taskId} | 特定のタスク詳細取得 | taskId (string, true) | なし | 200 (タスク詳細, { "id": string, "title": string, "description": string, "completed": boolean, "createdAt": timestamp, "updatedAt": timestamp }) <br> 404 (タスク未発見) | taskIdは有効なID、かつ認証ユーザーが所有するタスクである必要がある |
| PUT /tasks/{taskId} | タスク更新 | taskId (string, true) | { "title": string (optional), "description": string (optional), "completed": boolean (optional) } | 200 (更新成功) <br> 400 (無効なリクエスト) <br> 404 (タスク未発見) | 認証ユーザーが所有するタスクのみ更新可能。updatedAtは自動更新される |
| DELETE /tasks/{taskId} | タスク削除 | taskId (string, true) | なし | 204 (削除成功) <br> 404 (タスク未発見) | 認証ユーザーが所有するタスクのみ削除可能 |
| PATCH /tasks/{taskId}/toggle | タスク完了状態切り替え | taskId (string, true) | { "completed": boolean } | 200 (更新成功) <br> 404 (タスク未発見) | 認証ユーザーが所有するタスクのみ更新可能。サーバー側で現在の値を自動的にcompletedの値を反転させる |

## データモデル

### ユーザー (Firebase Authentication)
```
{
  "uid": string,      // Firebase認証が生成する一意のユーザーID
  "email": string,    // ユーザーのメールアドレス
  "password": string  // ハッシュ化されて保存（直接アクセス不可）
}
```

### タスク (Firestore)
```
{
  "id": string,             // ドキュメントID (自動生成)
  "userId": string,         // 所有ユーザーID (Firebase Authentication UID)
  "title": string,          // タスクのタイトル（必須）
  "description": string,    // タスクの詳細説明（オプション）
  "completed": boolean,     // タスクの完了状態（デフォルトはfalse）
  "createdAt": timestamp,   // タスク作成日時
  "updatedAt": timestamp    // 最終更新日時
}
```

## 7. 技術スタック詳細

### 7.1 フロントエンド
- React.js（TypeScript）
- React Router（画面遷移）
- React Hook Form（フォーム管理）
- 状態管理：React Context API（規模が小さいため）
- スタイリング：Tailwind CSS または styled-components

### 7.2 バックエンド（サーバーレス）
- Firebase Authentication（認証）
- Firestore（データベース）
- Firebase Hosting（ホスティング）

### 7.3 開発環境
- Version Control: Git
- Package Manager: npm
- Linting: ESLint + Prettier
- Build Tool: Vite

## 8. プロジェクト構成

```
src/
├── components/            # 再利用可能なコンポーネント
│   ├── auth/              # 認証関連コンポーネント
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordReset.tsx
│   ├── tasks/             # タスク関連コンポーネント
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilter.tsx
│   └── common/            # 共通コンポーネント
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Modal.tsx
├── contexts/              # コンテキスト
│   ├── AuthContext.tsx    # 認証コンテキスト
│   └── TaskContext.tsx    # タスク管理コンテキスト
├── services/              # Firebase連携
│   ├── firebase.ts        # Firebase初期化
│   ├── auth.ts            # 認証サービス
│   └── tasks.ts           # タスクCRUDサービス
├── pages/                 # ページコンポーネント
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ResetPassword.tsx
│   └── Dashboard.tsx      # タスク一覧画面
├── hooks/                 # カスタムフック
│   ├── useAuth.ts         # 認証フック
│   └── useTasks.ts        # タスク操作フック
├── types/                 # 型定義
│   └── index.ts
├── utils/                 # ユーティリティ関数
├── App.tsx                # メインコンポーネント
└── main.tsx               # エントリーポイント
```

## セキュリティ要件

- すべてのAPIエンドポイントは、/auth/registerと/auth/loginを除き、有効な認証トークンが必要
- ユーザーは自分が作成したタスクのみ閲覧・編集・削除が可能
- レスポンスには必要最小限の情報のみを含め、機密情報は返さない
- すべてのリクエストはHTTPS経由で行われる
- Firebase Securityルールでデータアクセスを制限する