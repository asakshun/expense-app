# インフラストラクチャ層

## セットアップ

### 1. 依存関係のインストール

WSL環境で以下のコマンドを実行してください：

```bash
npm install @notionhq/client
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Notion API設定
NOTION_API_KEY=your_notion_api_key_here
NOTION_EXPENSE_DATABASE_ID=your_expense_database_id_here
NOTION_SETTINGS_DATABASE_ID=your_settings_database_id_here
```

`.env.example` ファイルをテンプレートとして使用できます。

### 3. Notion APIキーの取得

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 新しいインテグレーションを作成
3. Internal Integration Tokenをコピー
4. `.env` ファイルの `NOTION_API_KEY` に設定

### 4. Notionデータベースの作成

#### 支出データベース

以下のプロパティを持つデータベースを作成してください：

- **金額** (Number): 支出金額
- **日付** (Date): 支出日

データベースIDをコピーして `.env` ファイルの `NOTION_EXPENSE_DATABASE_ID` に設定してください。

#### 設定データベース

以下のプロパティを持つデータベースを作成してください：

- **設定名** (Title): 設定項目の名前
- **値** (Number): 設定値

データベースIDをコピーして `.env` ファイルの `NOTION_SETTINGS_DATABASE_ID` に設定してください。

### 5. データベースへのアクセス権限の付与

作成した各データベースページで、インテグレーションへのアクセス権限を付与してください：

1. データベースページを開く
2. 右上の「...」メニューをクリック
3. 「接続」→ 作成したインテグレーションを選択

## コンポーネント

### NotionConfig

Notion APIの設定を管理します。環境変数から設定を読み込みます。

### NotionExpenseGateway

`ExpenseRepository` インターフェースの実装。Notion APIを使用して支出データを永続化します。

**機能:**
- 支出の保存
- 期間内の支出の取得
- エラーハンドリングとリトライロジック（最大3回、指数バックオフ）

### NotionSettingsGateway

`SettingsRepository` インターフェースの実装。Notion APIを使用して設定データを永続化します。

**機能:**
- 設定の取得（存在しない場合はデフォルト値で作成）
- 設定の保存（既存の場合は更新、新規の場合は作成）
- エラーハンドリングとリトライロジック（最大3回、指数バックオフ）

## エラーハンドリング

両方のゲートウェイは以下のエラーハンドリング機能を提供します：

- **レート制限**: `Retry-After` ヘッダーに従って自動的にリトライ
- **一時的なエラー**: 指数バックオフ（1秒、2秒、4秒）でリトライ
- **最大リトライ回数**: 3回まで
- **エラーログ**: すべてのエラーをコンソールに記録

## 使用例

```typescript
import { Client } from '@notionhq/client';
import { NotionExpenseGateway } from './gateways/NotionExpenseGateway';
import { NotionSettingsGateway } from './gateways/NotionSettingsGateway';
import { getNotionConfig } from './config/NotionConfig';

// 設定の取得
const config = getNotionConfig();

// Notionクライアントの初期化
const client = new Client({ auth: config.apiKey });

// ゲートウェイの初期化
const expenseGateway = new NotionExpenseGateway(client, config.expenseDatabaseId);
const settingsGateway = new NotionSettingsGateway(client, config.settingsDatabaseId);

// 使用例
const settings = await settingsGateway.get();
const expenses = await expenseGateway.findByPeriod(period);
```
