# セットアップ手順

## 依存関係のインストール

プロジェクトのセットアップを完了するには、以下のコマンドを実行してください：

```bash
npm install
```

これにより、以下のテスト関連の依存関係がインストールされます：
- `jest` - テストフレームワーク
- `ts-jest` - TypeScript用のJestプリセット
- `fast-check` - プロパティベーステストライブラリ
- `@types/jest` - Jestの型定義
- `@types/fast-check` - fast-checkの型定義

## テストの実行

### すべてのテストを実行
```bash
npm test
```

### ウォッチモードでテストを実行
```bash
npm run test:watch
```

## プロジェクト構造

プロジェクトはクリーンアーキテクチャに従って構成されています：

```
src/
├── domain/                    # エンティティ層
│   ├── entities/             # ドメインエンティティ
│   └── value-objects/        # 値オブジェクト
├── application/              # ユースケース層
│   ├── use-cases/           # ユースケース実装
│   └── repositories/        # リポジトリインターフェース
├── infrastructure/           # インフラストラクチャ層
│   └── gateways/            # リポジトリ実装
└── presentation/             # プレゼンテーション層
    ├── controllers/         # HTTPコントローラー
    └── presenters/          # プレゼンター
```

## 次のステップ

1. `npm install` を実行して依存関係をインストール
2. タスク2以降の実装を開始
3. 各実装後にテストを実行して検証

詳細は `.kiro/specs/expense-management-app/` のドキュメントを参照してください。
