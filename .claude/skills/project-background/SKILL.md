---
name: project-background
description: プロジェクトの背景・前提知識を提供するスキル
---

# Project Background Skill

このスキルはプロジェクトの背景・前提知識を提供します。コードを書く・レビューする前に必ずこの内容を参照してください。

---

## アプリケーション概要

**支出管理アプリ (expense-app)**

LINE公式アカウントをインターフェースとした個人向け支出管理アプリ。

### 基本機能フロー
1. ユーザーがLINE公式アカウントに**金額（数字）をチャット送信**
2. WebhookでNext.jsが受信 → NotionのDBにデータを保存
3. 保存後、LINEのクイックリプライでカテゴリ選択を促す
4. ユーザーがカテゴリを選択 → Postbackイベントでカテゴリを更新
5. **LIFFアプリ**（LINE内ブラウザ）で支出合計・期間を確認できる

### デプロイ先
- **Vercel**（Next.js App Router）

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5（Strict mode） |
| UI | React 19 + Tailwind CSS 4 |
| DB | Notion API（@notionhq/client） |
| Messaging | LINE Bot SDK v10（@line/bot-sdk） |
| LIFF | LINE LIFF SDK（CDN経由） |
| Test | Jest 30 + fast-check（Property-based testing） |
| DI | 自前のSingletonコンテナ |

---

## アーキテクチャ：クリーンアーキテクチャ

```
src/
├── domain/           # エンティティ・値オブジェクト（依存なし）
│   ├── entities/     # Expense, Settings
│   └── value-objects/ # Amount, Category, ExpenseDate, Period
├── application/      # ユースケース・リポジトリインターフェース
│   ├── use-cases/    # RecordExpense, GetExpenseSummary, UpdateSettings, UpdateExpenseCategory
│   └── repositories/ # ExpenseRepository, SettingsRepository（interface）
├── infrastructure/   # インターフェースの実装・外部連携
│   ├── gateways/     # NotionExpenseGateway, NotionSettingsGateway
│   ├── config/       # NotionConfig, CategoryConfig
│   └── di/           # Container（DIコンテナ）
└── presentation/     # コントローラー・プレゼンター
    ├── controllers/  # WebhookController, LIFFController
    └── presenters/   # WebhookPresenter, LIFFPresenter

app/                  # Next.js App Router（エントリポイント）
├── api/
│   ├── webhook/      # POST: LINE Webhook受信
│   └── liff/
│       ├── summary/  # GET: 支出合計取得
│       └── settings/ # POST: 設定更新
└── liff/             # LIFF UIページ（クライアントコンポーネント）
```

### 依存方向ルール
```
domain ← application ← infrastructure
                      ← presentation
```
- domain は誰にも依存しない
- application は domain にのみ依存
- infrastructure・presentation は application に依存（domain にも依存可）
- 上位レイヤーが下位レイヤーに依存してはならない

---

## ドメインモデル

### エンティティ

**Expense**（支出）
- `id`: UUID
- `amount`: Amount（値オブジェクト）
- `date`: ExpenseDate（値オブジェクト）
- `category?`: Category（値オブジェクト、任意）

**Settings**（設定）
- `id`: UUID
- `startDay`: `1 | 25`（月の集計開始日）

### 主要値オブジェクト

**Amount**: 非負の数値。`fromString()` / `fromNumber()` でResult型を返す
**Category**: 1〜50文字の文字列。`fromString()` でResult型を返す
**ExpenseDate**: 日付のラッパー。イミュータブル
**Period**: startDayと現在日付から集計期間を算出
- startDay=1: 当月1日〜月末
- startDay=25: 前月25日〜当月24日 or 当月25日〜翌月24日

---

## ユースケース一覧

| ユースケース | 入力 | 概要 |
|---|---|---|
| RecordExpenseUseCase | `amountText: string` | 支出を記録 |
| GetExpenseSummaryUseCase | `currentDate?: Date` | 期間内の支出合計を取得 |
| UpdateSettingsUseCase | `startDay: 1 \| 25` | 集計開始日を変更 |
| UpdateExpenseCategoryUseCase | `recordId, categoryText` | 支出のカテゴリを更新 |

---

## Notionデータベース構造

**支出DB（NOTION_EXPENSE_DATABASE_ID）**

| プロパティ名 | 型 | 備考 |
|---|---|---|
| 金額 | Number | 支出金額 |
| 日付 | Date | 支出日（ISO 8601） |
| カテゴリ | Select | 任意。後からPostbackで設定 |

**設定DB（NOTION_SETTINGS_DATABASE_ID）**

| プロパティ名 | 型 | 備考 |
|---|---|---|
| 名前 | Title | 固定値: "始まり日" |
| startDay | Number | 1 or 25 |

---

## カテゴリ設定

デフォルト8カテゴリ: food, transport, entertainment, utilities, shopping, health, education, other
`EXPENSE_CATEGORIES` 環境変数でカスタマイズ可（5〜13個の制約あり）
`CategoryConfig` クラスが管理。`getCategoryLabel()` で日本語ラベル取得。

---

## 環境変数

```env
# Notion
NOTION_API_KEY
NOTION_EXPENSE_DATABASE_ID
NOTION_SETTINGS_DATABASE_ID

# LINE
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN

# LIFF（フロントエンド公開）
NEXT_PUBLIC_LIFF_ID

# オプション
EXPENSE_CATEGORIES   # JSON配列でカスタムカテゴリ定義
```

---

## インフラ実装の特徴

**Notionゲートウェイの共通実装**
- リトライ: 最大3回、指数バックオフ（1s → 2s → 4s）
- レートリミット: `Retry-After` ヘッダーを尊重
- エラーはconsole.errorでログ出力

**DIコンテナ（Container.ts）**
- Singletonパターン
- 全依存関係を1箇所で初期化
- `resetInstance()` でテスト用リセット可能

---

## テスト方針

- テストは `src/` 配下の `__tests__/` に配置
- **Jest** でユニットテスト
- **fast-check** でProperty-based testing（値オブジェクトに特に有用）
- カバレッジ閾値: ブランチ75% / 関数・行・ステートメント80%
- `jest.config.js` で `src/` をルートとして設定

---

## コーディング規約

- TypeScript strict モード必須
- エラーハンドリングはResult型（success/error）を使用（例外を投げない）
- ユーザー向けメッセージは**日本語**
- パス alias: `@/*` → プロジェクトルート直下
- 新機能追加時は必ずクリーンアーキテクチャの層を意識し、依存方向を守る

---

## 主要ファイルパス早見表

| 役割 | パス |
|---|---|
| Webhookエントリ | `app/api/webhook/route.ts` |
| LIFF UIページ | `app/liff/page.tsx` |
| DIコンテナ | `src/infrastructure/di/Container.ts` |
| 支出エンティティ | `src/domain/entities/Expense.ts` |
| Notionゲートウェイ | `src/infrastructure/gateways/NotionExpenseGateway.ts` |
| WebhookPresenter | `src/presentation/presenters/WebhookPresenter.ts` |
| カテゴリ設定 | `src/infrastructure/config/CategoryConfig.ts` |
