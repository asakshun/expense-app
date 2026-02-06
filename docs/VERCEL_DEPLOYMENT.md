# Vercelデプロイガイド

このドキュメントでは、支出管理アプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録可能）
- 環境変数の値（Notion API、LINE API、LIFF ID）が準備済み

## デプロイ手順

### 1. GitHubリポジトリの準備

#### リポジトリの作成（まだの場合）

```bash
# Gitの初期化（まだの場合）
git init

# .gitignoreの確認（.env.localが含まれていることを確認）
cat .gitignore

# 初回コミット
git add .
git commit -m "Initial commit"

# GitHubリポジトリを作成し、リモートを追加
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 2. Vercelプロジェクトの作成

#### オプション A: Vercel CLI を使用

```bash
# Vercel CLIのインストール（グローバル）
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトのデプロイ
vercel

# 質問に答える：
# - Set up and deploy? Yes
# - Which scope? あなたのアカウントを選択
# - Link to existing project? No
# - What's your project's name? expenses-app（または任意の名前）
# - In which directory is your code located? ./
# - Want to override the settings? No
```

#### オプション B: Vercel Dashboard を使用

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
5. 「Deploy」はまだクリックしない（環境変数を先に設定）

### 3. Vercelでの環境変数設定

#### Vercel Dashboard での設定

1. プロジェクトの「Settings」タブを開く
2. 左メニューから「Environment Variables」を選択
3. 以下の環境変数を追加：

| Name | Value | Environment |
|------|-------|-------------|
| `NOTION_API_KEY` | `secret_xxxxx...` | Production, Preview, Development |
| `NOTION_EXPENSE_DATABASE_ID` | `xxxxx...` | Production, Preview, Development |
| `NOTION_SETTINGS_DATABASE_ID` | `yyyyy...` | Production, Preview, Development |
| `LINE_CHANNEL_SECRET` | `xxxxx...` | Production, Preview, Development |
| `LINE_CHANNEL_ACCESS_TOKEN` | `xxxxx...` | Production, Preview, Development |
| `NEXT_PUBLIC_LIFF_ID` | `xxxx-xxxxxxxx` | Production, Preview, Development |

**重要**: 
- `NEXT_PUBLIC_` で始まる変数はクライアントサイドで使用されます
- その他の変数はサーバーサイドのみで使用されます
- すべての環境（Production, Preview, Development）にチェックを入れることを推奨

#### Vercel CLI での設定

```bash
# 環境変数を追加
vercel env add NOTION_API_KEY
# 値を入力し、環境を選択（Production, Preview, Development）

# 他の環境変数も同様に追加
vercel env add NOTION_EXPENSE_DATABASE_ID
vercel env add NOTION_SETTINGS_DATABASE_ID
vercel env add LINE_CHANNEL_SECRET
vercel env add LINE_CHANNEL_ACCESS_TOKEN
vercel env add NEXT_PUBLIC_LIFF_ID
```

### 4. 初回デプロイ

#### Vercel Dashboard の場合

1. 環境変数の設定が完了したら「Deploy」をクリック
2. デプロイが完了するまで待機（通常1-3分）
3. デプロイ完了後、URLが表示されます（例：`https://your-app.vercel.app`）

#### Vercel CLI の場合

```bash
# 本番環境にデプロイ
vercel --prod
```

### 5. LINE設定の更新

デプロイが完了したら、VercelのURLを使ってLINE側の設定を更新します。

#### Webhook URLの更新

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. チャネルを選択
3. 「Messaging API」タブを開く
4. 「Webhook settings」で「Edit」をクリック
5. Webhook URLを更新：`https://your-app.vercel.app/api/webhook`
6. 「Update」をクリック
7. 「Verify」をクリックして接続を確認

#### LIFF Endpoint URLの更新

1. LINE Developers Consoleで同じチャネルを開く
2. 「LIFF」タブを開く
3. 作成したLIFFアプリの「Edit」をクリック
4. Endpoint URLを更新：`https://your-app.vercel.app/liff`
5. 「Update」をクリック

### 6. 動作確認

#### Webhook（メッセージング）の確認

1. LINEアプリでボットを友だち追加
2. 数値メッセージを送信（例：「1000」）
3. 成功メッセージが返信されることを確認
4. Notionデータベースに記録されていることを確認

#### LIFF（表示）の確認

1. LINEアプリでボットのトーク画面を開く
2. リッチメニューまたはLIFF URLから「支出管理」を開く
3. 合計額が表示されることを確認
4. 始まり日トグルが動作することを確認

## 継続的デプロイ

Vercelは自動的に継続的デプロイを設定します：

- **mainブランチへのpush**: 本番環境に自動デプロイ
- **他のブランチへのpush**: プレビュー環境に自動デプロイ

```bash
# 変更をコミット
git add .
git commit -m "Update feature"

# mainブランチにpush（自動的に本番デプロイ）
git push origin main
```

## デプロイログの確認

### Vercel Dashboard

1. プロジェクトの「Deployments」タブを開く
2. 最新のデプロイをクリック
3. 「Building」→「Logs」でビルドログを確認
4. エラーがある場合はここで確認できます

### Vercel CLI

```bash
# デプロイログを表示
vercel logs
```

## トラブルシューティング

### ビルドエラー

**エラー**: `Module not found`
- **原因**: 依存関係がインストールされていない
- **解決**: `package.json` を確認し、必要なパッケージを追加

**エラー**: `Type error`
- **原因**: TypeScriptの型エラー
- **解決**: ローカルで `npm run build` を実行して確認

### 環境変数エラー

**エラー**: `NOTION_API_KEY is not defined`
- **原因**: 環境変数が設定されていない
- **解決**: Vercel Dashboardで環境変数を確認・追加

**エラー**: `Invalid LIFF ID`
- **原因**: `NEXT_PUBLIC_LIFF_ID` が正しく設定されていない
- **解決**: 環境変数名が `NEXT_PUBLIC_` で始まっていることを確認

### Webhook エラー

**エラー**: LINE Webhook verification failed
- **原因**: Webhook URLが間違っている、またはアプリがデプロイされていない
- **解決**: 
  1. Vercelのデプロイが完了していることを確認
  2. Webhook URLが `https://your-app.vercel.app/api/webhook` であることを確認
  3. Vercelのログでエラーを確認

### LIFF エラー

**エラー**: LIFF app not found
- **原因**: LIFF Endpoint URLが間違っている
- **解決**: LINE Developers ConsoleでEndpoint URLを確認

## カスタムドメインの設定（オプション）

### 手順

1. Vercel Dashboardでプロジェクトを開く
2. 「Settings」→「Domains」を選択
3. 「Add」をクリック
4. ドメイン名を入力（例：`expenses.yourdomain.com`）
5. DNSレコードを設定（Vercelが指示を表示）
6. 検証が完了するまで待機

### LINE設定の更新

カスタムドメインを設定したら、LINE側の設定も更新：
- Webhook URL: `https://expenses.yourdomain.com/api/webhook`
- LIFF Endpoint URL: `https://expenses.yourdomain.com/liff`

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - 本番環境の環境変数は絶対に公開しない
   - 定期的にトークンをローテーション

2. **アクセス制御**
   - Vercelプロジェクトへのアクセスを制限
   - チームメンバーには必要最小限の権限を付与

3. **モニタリング**
   - Vercel Analyticsを有効化してパフォーマンスを監視
   - エラーログを定期的に確認

4. **バックアップ**
   - Notionデータベースを定期的にエクスポート
   - 重要な設定をドキュメント化

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables on Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

