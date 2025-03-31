# AI駆動開発ハンドブック: API→フロント→バック→マージ

## 目次
1. [Phase 1: API設計と仕様実装](#phase-1-api設計と仕様実装)
2. [Phase 2: フロントエンド＋モック実装](#phase-2-フロントエンドモック実装)
3. [Phase 3: バックエンド実装](#phase-3-バックエンド実装)
4. [Phase 4: バックエンドとフロントエンドのマージ](#phase-4-バックエンドとフロントエンドのマージ)
5. [AI活用のコツ](#ai活用のコツ)

---

## Phase 1: API設計と仕様実装

### ステップ 1.1: API要件定義
```
# AIプロンプト例
「次のような機能要件があります: [機能要件を記述]
これに必要なAPIエンドポイントを設計してください。RESTful設計原則に従い、
各エンドポイントのパス、HTTPメソッド、リクエスト/レスポンスの形式を含めてください。」
```

### ステップ 1.2: OpenAPI仕様書作成
```yaml
# openapi.yaml の例
openapi: 3.0.0
info:
  title: サンプルAPI
  version: 1.0.0
paths:
  /users:
    get:
      summary: ユーザー一覧取得
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### ステップ 1.3: API仕様の検証
- [ ] エンドポイントは全ての機能要件をカバーしているか
- [ ] リソース設計は一貫しているか
- [ ] エラーレスポンスが適切に定義されているか

### ステップ 1.4: API仕様書のバージョン管理
```bash
git add openapi.yaml
git commit -m "Add initial OpenAPI specification"
```

---

## Phase 2: フロントエンド＋モック実装

### ステップ 2.1: モックサーバー構築
```javascript
// モックサーバーの例 (Express.js)
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'ユーザー1' },
    { id: 2, name: 'ユーザー2' }
  ]);
});

app.listen(3001, () => console.log('Mock server running on port 3001'));
```

### ステップ 2.2: API接続クラス実装
```typescript
// api-client.ts
export class ApiClient {
  private baseUrl = 'http://localhost:3001/api';
  
  async getUsers() {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }
  
  // 他のAPI呼び出しメソッド
}
```

### ステップ 2.3: フロントエンド実装
```
# AIプロンプト例
「以下のAPI仕様に基づくユーザー一覧表示画面をReactコンポーネントで実装してください:
[OpenAPI仕様の該当部分]」
```

### ステップ 2.4: 統合テスト（モック使用）
```javascript
// フロントエンド統合テストの例
test('ユーザー一覧が表示される', async () => {
  render(<UserList />);
  await waitFor(() => {
    expect(screen.getByText('ユーザー1')).toBeInTheDocument();
    expect(screen.getByText('ユーザー2')).toBeInTheDocument();
  });
});
```

### ステップ 2.5: フロントエンドのバージョン管理
```bash
git add src/
git commit -m "Implement frontend with mock API integration"
```

---

## Phase 3: バックエンド実装

### ステップ 3.1: データモデル実装
```
# AIプロンプト例
「以下のOpenAPI仕様に基づくデータモデルをTypeScriptで実装してください:
[OpenAPI仕様のスキーマ部分]」
```

### ステップ 3.2: ルーティング設定
```javascript
// Express.jsルーティング例
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
// その他のルート設定

module.exports = router;
```

### ステップ 3.3: コントローラー実装
```javascript
// user-controller.js
const User = require('../models/user');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 他のコントローラーメソッド
```

### ステップ 3.4: バックエンドテスト
```javascript
// バックエンドユニットテストの例
test('getUsers returns all users', async () => {
  // モックセットアップ
  const mockUsers = [{ id: 1, name: 'テストユーザー' }];
  User.findAll = jest.fn().mockResolvedValue(mockUsers);
  
  const req = {};
  const res = { json: jest.fn() };
  
  await userController.getUsers(req, res);
  expect(res.json).toHaveBeenCalledWith(mockUsers);
});
```

### ステップ 3.5: バックエンドのバージョン管理
```bash
git add server/
git commit -m "Implement backend with database integration"
```

---

## Phase 4: バックエンドとフロントエンドのマージ

### ステップ 4.1: 環境変数設定
```
# .env.development
API_BASE_URL=http://localhost:3000/api

# .env.production
API_BASE_URL=/api
```

### ステップ 4.2: API接続先切り替え
```typescript
// api-client.ts (更新版)
export class ApiClient {
  private baseUrl = process.env.API_BASE_URL;
  
  // 前と同じメソッド
}
```

### ステップ 4.3: 統合テスト（実装版）
```
# AIプロンプト例
「以下のAPIエンドポイント呼び出しをテストするE2Eテストをcypressで実装してください:
[テスト対象エンドポイントの説明]」
```

### ステップ 4.4: デプロイパイプライン構築
```yaml
# .github/workflows/deploy.yml 例
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      # デプロイステップ
```

### ステップ 4.5: 本番リリース確認リスト
- [ ] API契約の一貫性確認
- [ ] 全テストの合格確認
- [ ] パフォーマンステスト
- [ ] セキュリティスキャン

---

## AI活用のコツ

### 効果的なAIプロンプト
- **コンテキスト提供**: 既存コードや仕様書を必ず含める
- **明確な指示**: 具体的な命名規則やコーディングスタイルを指定
- **段階的生成**: 複雑なコードは部分ごとに生成させる

### AIエディタでのコード生成
```javascript
// AIに続きを生成させる例
// コメントでAPIの仕様を記述
/**
 * ユーザー一覧取得API:
 * GET /api/users
 * レスポンス: User[]
 * 
 * User: { id: number, name: string, email: string }
 */
// AIがここから続きを生成
```

### コード修正プロンプト
```
# バグ修正プロンプト例
「以下のコードでXというエラーが発生しています。
[エラーメッセージ]
[関連コード]
問題の原因と修正方法を教えてください。」
```

### ドキュメント生成
```
# ドキュメント生成プロンプト例
「以下のAPIコントローラーコードに基づいて、APIの利用方法ドキュメントをマークダウン形式で生成してください:
[コントローラーコード]」
```

---

この手順書はAIエディタで参照しやすいよう、各フェーズを明確に分け、コード例やプロンプト例を含めています。開発の進行に応じて参照し、AIツールを最大限に活用することで開発効率を向上させることができます。