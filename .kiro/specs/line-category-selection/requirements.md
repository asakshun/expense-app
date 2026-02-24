# Requirements Document

## Introduction

Expense-appにおいて、LINEで金額を送信した際にカテゴリ選択機能を追加します。現在は金額を送信するとNotionのDBに直接記録されますが、この機能により、金額送信後にLINEからカテゴリ選択メッセージが返信され、ユーザーがカテゴリを選択できるようになります。金額送信時点でNotionレコードは作成され、カテゴリ選択時に該当レコードが更新される仕組みです。

## Glossary

- **LINE_Webhook_Handler**: LINEからのメッセージを受信し処理するシステムコンポーネント

- **Notion_Record_Manager**: Notion DBのレコードを作成・更新するシステムコンポーネント

- **Category_Selector**: カテゴリ選択UIを提供し、選択結果を処理するシステムコンポーネント

- **Expense_Record**: Notion DBに保存される支出記録（金額、カテゴリ、日時などを含む）

- **Amount_Message**: ユーザーがLINEで送信する金額を含むメッセージ

- **Category_Selection_Message**: カテゴリ選択を促すLINEメッセージ（選択肢を含む）

- **Postback_Event**: LINEのボタンやクイックリプライから送信されるイベント

## Requirements

### Requirement 1: 金額メッセージ受信時のNotion レコード作成

**User Story:** As a ユーザー, I want 金額を送信した時点でNotionレコードが作成される, so that データが確実に保存され、後からカテゴリを追加できる

#### Acceptance Criteria

1. WHEN Amount_Messageを受信, THE LINE_Webhook_Handler SHALL 金額を抽出する

2. WHEN 金額が正常に抽出された, THE Notion_Record_Manager SHALL カテゴリ未設定のExpense_Recordを作成する

3. THE Expense_Record SHALL 金額、作成日時、レコードIDを含む

4. WHEN Expense_Recordが作成された, THE LINE_Webhook_Handler SHALL レコードIDを一時保存する

### Requirement 2: カテゴリ選択メッセージの送信

**User Story:** As a ユーザー, I want 金額送信後にカテゴリ選択メッセージを受け取る, so that 適切なカテゴリを選択できる

#### Acceptance Criteria

1. WHEN Expense_Recordが作成された, THE Category_Selector SHALL Category_Selection_Messageを生成する

2. THE Category_Selection_Message SHALL 利用可能なカテゴリの選択肢を含む

3. THE Category_Selection_Message SHALL クイックリプライまたはボタンテンプレートを使用する

4. WHEN Category_Selection_Messageが生成された, THE LINE_Webhook_Handler SHALL ユーザーにメッセージを送信する

5. THE Category_Selection_Message SHALL 対応するExpense_RecordのレコードIDを関連付ける

### Requirement 3: カテゴリ選択の処理

**User Story:** As a ユーザー, I want カテゴリを選択したら該当レコードが更新される, so that 支出記録が完全な状態で保存される

#### Acceptance Criteria

1. WHEN Postback_Eventを受信, THE LINE_Webhook_Handler SHALL カテゴリ情報とレコードIDを抽出する

2. WHEN カテゴリ情報が抽出された, THE Notion_Record_Manager SHALL 対応するExpense_Recordを検索する

3. WHEN Expense_Recordが見つかった, THE Notion_Record_Manager SHALL カテゴリフィールドを更新する

4. WHEN 更新が成功した, THE LINE_Webhook_Handler SHALL 確認メッセージをユーザーに送信する

5. IF Expense_Recordが見つからない, THEN THE LINE_Webhook_Handler SHALL エラーメッセージをユーザーに送信する

### Requirement 4: カテゴリマスタデータの管理

**User Story:** As a システム管理者, I want カテゴリのリストを管理できる, so that ユーザーに適切な選択肢を提供できる

#### Acceptance Criteria

1. THE Category_Selector SHALL 定義済みカテゴリリストを保持する

2. THE Category_Selector SHALL 各カテゴリに表示名と識別子を含む

3. WHEN カテゴリリストが要求された, THE Category_Selector SHALL 利用可能な全カテゴリを返す

4. THE Category_Selector SHALL 最低5つのカテゴリ（食費、交通費、娯楽、日用品、その他）をサポートする

### Requirement 5: レコードIDとカテゴリ選択の関連付け

**User Story:** As a システム, I want レコードIDとカテゴリ選択を正確に関連付ける, so that 正しいレコードが更新される

#### Acceptance Criteria

1. WHEN Category_Selection_Messageを生成, THE Category_Selector SHALL 各選択肢にレコードIDを埋め込む

2. THE Category_Selector SHALL Postback_EventのdataフィールドにレコードIDとカテゴリIDを含める

3. WHEN Postback_Eventを受信, THE LINE_Webhook_Handler SHALL dataフィールドからレコードIDとカテゴリIDを正確に抽出する

4. THE LINE_Webhook_Handler SHALL レコードIDの形式を検証する

### Requirement 6: エラーハンドリング

**User Story:** As a ユーザー, I want エラーが発生した場合に適切な通知を受け取る, so that 問題を認識し対処できる

#### Acceptance Criteria

1. IF Notion_Record_Managerがレコード作成に失敗, THEN THE LINE_Webhook_Handler SHALL エラーメッセージをユーザーに送信する

2. IF Notion_Record_Managerがレコード更新に失敗, THEN THE LINE_Webhook_Handler SHALL エラーメッセージをユーザーに送信する

3. IF 金額の抽出に失敗, THEN THE LINE_Webhook_Handler SHALL 金額形式のガイダンスメッセージを送信する

4. THE LINE_Webhook_Handler SHALL 全てのエラーをログに記録する

### Requirement 7: 既存機能との互換性

**User Story:** As a ユーザー, I want 既存の金額送信機能が引き続き動作する, so that スムーズに新機能を利用できる

#### Acceptance Criteria

1. WHEN Amount_Messageを受信, THE LINE_Webhook_Handler SHALL 既存の金額抽出ロジックを使用する

2. THE Notion_Record_Manager SHALL 既存のNotion DB接続を使用する

3. THE LINE_Webhook_Handler SHALL 既存のwebhook APIエンドポイント（app/api/webhook/route.ts）を拡張する

4. WHEN カテゴリ選択機能が追加された, THE システム SHALL 既存のLINE連携機能に影響を与えない

### Requirement 8: ユーザーエクスペリエンス

**User Story:** As a ユーザー, I want カテゴリ選択が直感的で迅速, so that ストレスなく支出を記録できる

#### Acceptance Criteria

1. WHEN Category_Selection_Messageを受信, THE ユーザー SHALL ワンタップでカテゴリを選択できる

2. WHEN カテゴリを選択, THE LINE_Webhook_Handler SHALL 2秒以内に確認メッセージを送信する

3. THE Category_Selection_Message SHALL 視覚的に分かりやすいフォーマットを使用する

4. WHEN 更新が完了, THE LINE_Webhook_Handler SHALL 選択されたカテゴリ名を含む確認メッセージを送信する
