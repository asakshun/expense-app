# 支出管理アプリ

LINE Messaging APIとLIFF（LINE Front-end Framework）を統合した支出管理アプリケーションです。Notionをバックエンドデータベースとして使用し、LINEメッセージで簡単に支出を記録し、LIFFアプリで設定管理と合計額の確認ができます。

## 特徴

- **簡単な支出記録**: LINEメッセージで数値を送信するだけで支出を記録
- **柔軟な期間設定**: 給与日に合わせて始まり日（1日または25日）を設定可能
- **自動集計**: 設定した期間に基づいて自動的に支出を集計
- **Notion連携**: すべてのデータをNotionデータベースに保存
- **クリーンアーキテクチャ**: 保守性と拡張性を重視した設計

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **テスト**: Jest + fast-check (Property-Based Testing)
- **外部API**:
  - LINE Messaging API
  - LINE LIFF
  - Notion API

## アーキテクチャ

このプロジェクトはクリーンアーキテクチャの原則に従って設計されています：

```
src/
├── domain/              # エンティティ層（ビジネスロジック）
│   ├── entities/        # エンティティ（Expense, Settings）
│   └── value-objects/   # 値オブジェクト（Amount, Period, ExpenseDate）
├── application/         # ユースケース層
│   ├── use-cases/       # ユースケース
│   └── repositories/    # リポジトリインターフェース
├── infrastructure/      # インフラストラクチャ層
│   ├── gateways/        # Notion API実装
│   └── di/              # 依存性注入コンテナ
└── presentation/        # プレゼンテーション層
    ├── controllers/     # HTTPコントローラー
    └── presenters/      # プレゼンター
```

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn
- Notionアカウント
- LINE Developersアカウント

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd expenses-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Notionデータベースのセットアップ

Notionで2つのデータベースを作成する必要があります：

1. **支出データベース**: 日々の支出記録を保存
2. **設定データベース**: アプリケーション設定を保存

詳細な手順は [Notionデータベースセットアップガイド](./docs/NOTION_DATABASE_SETUP.md) を参照してください。

### 4. 環境変数の設定

`.env.local` ファイルを作成し、必要な環境変数を設定します：

```bash
cp .env.example .env.local
```

以下の環境変数を設定してください：

```env
# Notion API設定
NOTION_API_KEY=your_notion_api_key_here
NOTION_EXPENSE_DATABASE_ID=your_expense_database_id_here
NOTION_SETTINGS_DATABASE_ID=your_settings_database_id_here

# LINE API設定
LINE_CHANNEL_SECRET=your_line_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here

# LIFF設定
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
```

詳細な取得方法は [環境変数設定ガイド](./docs/ENVIRONMENT_SETUP.md) を参照してください。

### 5. ビルドの確認

環境変数が正しく設定されているか確認します：

```bash
npm run build
```

## 開発環境の起動

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### 主要なエンドポイント

- **Webhook**: `POST /api/webhook` - LINE Messaging APIからのWebhook
- **LIFF Summary**: `GET /api/liff/summary` - 支出合計の取得
- **LIFF Settings**: `POST /api/liff/settings` - 設定の更新
- **LIFF View**: `/liff` - LIFFアプリのUI

### ホットリロード

開発モードでは、ファイルを編集すると自動的にページが更新されます。

## テストの実行

### すべてのテストを実行

```bash
npm test
```

### ウォッチモードでテストを実行

```bash
npm run test:watch
```

### テストの種類

このプロジェクトでは2種類のテストを使用しています：

1. **ユニットテスト**: 特定の例とエッジケースを検証
2. **プロパティベーステスト**: fast-checkを使用して普遍的なプロパティを検証

### テストの構成

```
src/
├── domain/__tests__/           # ドメイン層のテスト
├── infrastructure/di/__tests__/ # DIコンテナのテスト
└── (各層のテストファイル)
```

## プロジェクト構造

```
expenses-app/
├── .kiro/                      # Kiro仕様ファイル
│   └── specs/
│       └── expense-management-app/
│           ├── requirements.md  # 要件定義書
│           ├── design.md        # 設計書
│           └── tasks.md         # 実装タスク
├── app/                        # Next.js App Router
│   ├── api/                    # APIルート
│   │   ├── webhook/            # LINE Webhook
│   │   └── liff/               # LIFF API
│   └── liff/                   # LIFFページ
├── src/                        # アプリケーションコード
│   ├── domain/                 # ドメイン層
│   ├── application/            # ユースケース層
│   ├── infrastructure/         # インフラ層
│   └── presentation/           # プレゼンテーション層
├── docs/                       # ドキュメント
│   ├── ENVIRONMENT_SETUP.md    # 環境変数設定ガイド
│   └── NOTION_DATABASE_SETUP.md # Notionセットアップガイド
├── public/                     # 静的ファイル
└── package.json                # プロジェクト設定
```

## 使い方

### 支出の記録

1. LINEで支出管理ボットを友だち追加
2. 金額を送信（例: `1000` または `1,000`）
3. 成功メッセージが返信されます

### 設定の変更と表示

1. LINEで「LIFF」メニューを開く
2. 始まり日トグルスイッチで1日/25日を切り替え
3. 現在の期間の合計支出が表示されます

### 期間の計算ルール

- **始まり日が1日**: 当月1日〜当月末日
- **始まり日が25日**:
  - 現在が1-24日: 前月25日〜当月24日
  - 現在が25日以降: 当月25日〜翌月24日

## デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数を設定（Settings → Environment Variables）
3. デプロイ

### 環境変数の設定

本番環境では、すべての環境変数をVercelのダッシュボードで設定してください。

### Webhook URLの更新

デプロイ後、LINE Developers Consoleで Webhook URL を更新：

```
https://your-domain.vercel.app/api/webhook
```

### LIFF Endpoint URLの更新

LINE Developers ConsoleでLIFF Endpoint URLを更新：

```
https://your-domain.vercel.app/liff
```

## トラブルシューティング

### ビルドエラー

**エラー**: 環境変数が見つからない

**解決**: `.env.local` ファイルが正しく設定されているか確認

### Notion APIエラー

**エラー**: `unauthorized`

**解決**: 
1. APIキーが正しいか確認
2. データベースにインテグレーションが接続されているか確認

### LINE Webhookエラー

**エラー**: `Invalid signature`

**解決**: `LINE_CHANNEL_SECRET` が正しいか確認

### LIFFエラー

**エラー**: `LIFF ID is not valid`

**解決**: `NEXT_PUBLIC_LIFF_ID` が正しいか確認

詳細は [環境変数設定ガイド](./docs/ENVIRONMENT_SETUP.md) のトラブルシューティングセクションを参照してください。

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- TypeScriptの型を適切に使用
- クリーンアーキテクチャの原則に従う
- テストを書く（ユニットテスト + プロパティベーステスト）
- ESLintルールに従う

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 参考リンク

- [要件定義書](./.kiro/specs/expense-management-app/requirements.md)
- [設計書](./.kiro/specs/expense-management-app/design.md)
- [実装タスク](./.kiro/specs/expense-management-app/tasks.md)
- [Notion API Documentation](https://developers.notion.com/)
- [LINE Messaging API Documentation](https://developers.line.biz/ja/docs/messaging-api/)
- [LINE LIFF Documentation](https://developers.line.biz/ja/docs/liff/)
- [Next.js Documentation](https://nextjs.org/docs)

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
