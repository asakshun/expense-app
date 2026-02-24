# 環境変数設定ガイド

このドキュメントでは、支出管理アプリケーションの実行に必要な環境変数の設定方法を説明します。

## 必要な環境変数一覧

アプリケーションを実行するには、以下の環境変数を設定する必要があります：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NOTION_API_KEY` | Notion APIの認証キー | ✓ |
| `NOTION_EXPENSE_DATABASE_ID` | 支出データを保存するNotionデータベースのID | ✓ |
| `NOTION_SETTINGS_DATABASE_ID` | 設定データを保存するNotionデータベースのID | ✓ |
| `LINE_CHANNEL_SECRET` | LINE Messaging APIのチャネルシークレット | ✓ |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging APIのチャネルアクセストークン | ✓ |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF アプリケーションのID | ✓ |

## セットアップ手順

### 1. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成します：

```bash
cp .env.example .env.local
```

### 2. Notion API キーの取得

#### 手順：

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 「新しいインテグレーション」をクリック
3. インテグレーション名を入力（例：「支出管理アプリ」）
4. 関連するワークスペースを選択
5. 「送信」をクリック
6. 表示される「Internal Integration Token」をコピー
7. `.env.local` ファイルの `NOTION_API_KEY` に貼り付け

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 注意事項：
- APIキーは `secret_` で始まります
- このキーは秘密情報です。絶対に公開リポジトリにコミットしないでください
- キーが漏洩した場合は、すぐに再生成してください

### 3. Notion データベースIDの取得

#### 手順：

1. Notionで支出データベースのページを開く
2. ブラウザのアドレスバーからURLをコピー
3. URLの形式: `https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
4. `?` の前の32文字の英数字がデータベースID
5. `.env.local` ファイルの `NOTION_EXPENSE_DATABASE_ID` に貼り付け

同様に設定データベースのIDも取得します。

```env
NOTION_EXPENSE_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_SETTINGS_DATABASE_ID=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

#### データベースへのアクセス権限の付与：

1. Notionデータベースページを開く
2. 右上の「...」メニューをクリック
3. 「接続」→「接続を追加」を選択
4. 作成したインテグレーション（例：「支出管理アプリ」）を選択
5. 両方のデータベース（支出・設定）に対して同じ操作を実行

### 4. LINE Channel Secret の取得

#### 手順：

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. プロバイダーを選択（または新規作成）
3. Messaging APIチャネルを作成（または既存のチャネルを選択）
4. 「Basic settings」タブを開く
5. 「Channel secret」をコピー
6. `.env.local` ファイルの `LINE_CHANNEL_SECRET` に貼り付け

```env
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. LINE Channel Access Token の取得

#### 方法A: コンソールから直接発行（推奨・簡単）

1. LINE Developers Consoleで同じチャネルを開く
2. 「Messaging API」タブを開く
3. 「Channel access token (long-lived)」セクションで「Issue」をクリック
4. 生成されたトークンをコピー
5. `.env.local` ファイルの `LINE_CHANNEL_ACCESS_TOKEN` に貼り付け

```env
LINE_CHANNEL_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意**: このトークンは長期有効で、すぐに使用できます。個人開発やMVPに最適です。

#### 方法B: JWTを使って発行（上級者向け）

より高度な制御が必要な場合は、[JWTを使ったトークン発行](https://developers.line.biz/ja/docs/messaging-api/generate-json-web-token/)を参照してください。トークンの有効期限を細かく制御したい場合や、エンタープライズレベルのセキュリティが必要な場合に使用します。

#### Webhook URLの設定：

1. 「Messaging API」タブの「Webhook settings」セクションで「Edit」をクリック
2. Webhook URL を入力：`https://your-domain.com/api/webhook`
3. 「Use webhook」を有効化
4. 「Verify」をクリックして接続を確認

### 6. LIFF ID の取得

#### 手順：

1. LINE Developers Consoleで同じチャネルを開く
2. 「LIFF」タブを開く
3. 「Add」をクリックして新しいLIFFアプリを作成
4. 以下の情報を入力：
   - **LIFF app name**: 支出管理
   - **Size**: Full
   - **Endpoint URL**: `https://your-domain.com/liff`
   - **Scopes**: `profile`, `openid`
5. 「Add」をクリック
6. 生成された「LIFF ID」（`xxxx-xxxxxxxx` の形式）をコピー
7. `.env.local` ファイルの `NEXT_PUBLIC_LIFF_ID` に貼り付け

```env
NEXT_PUBLIC_LIFF_ID=xxxx-xxxxxxxx
```

## 環境変数の検証

すべての環境変数を設定したら、以下のコマンドで検証できます：

```bash
npm run build
```

ビルドが成功すれば、環境変数は正しく設定されています。

## セキュリティのベストプラクティス

1. **絶対に `.env.local` をGitにコミットしない**
   - `.gitignore` に `.env.local` が含まれていることを確認

2. **本番環境では環境変数を安全に管理**
   - Vercel、Netlify、AWS等のプラットフォームの環境変数機能を使用
   - シークレット管理サービス（AWS Secrets Manager等）の利用を検討

3. **定期的なキーのローテーション**
   - APIキーとトークンを定期的に再生成
   - 特に漏洩の疑いがある場合は即座に再生成

4. **最小権限の原則**
   - Notion インテグレーションには必要最小限の権限のみを付与
   - LINE チャネルの設定も同様

## トラブルシューティング

### Notion API エラー

**エラー**: `unauthorized`
- **原因**: APIキーが無効、またはデータベースへのアクセス権限がない
- **解決**: APIキーを確認し、データベースにインテグレーションを接続

**エラー**: `object_not_found`
- **原因**: データベースIDが間違っている
- **解決**: データベースURLから正しいIDをコピー

### LINE API エラー

**エラー**: `Invalid signature`
- **原因**: Channel Secretが間違っている
- **解決**: LINE Developers Consoleから正しいChannel Secretをコピー

**エラー**: `Invalid access token`
- **原因**: Channel Access Tokenが無効または期限切れ
- **解決**: 新しいトークンを発行

### LIFF エラー

**エラー**: `LIFF ID is not valid`
- **原因**: LIFF IDが間違っている
- **解決**: LINE Developers ConsoleのLIFFタブから正しいIDをコピー

## 参考リンク

- [Notion API Documentation](https://developers.notion.com/)
- [LINE Messaging API Documentation](https://developers.line.biz/ja/docs/messaging-api/)
- [LINE LIFF Documentation](https://developers.line.biz/ja/docs/liff/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
