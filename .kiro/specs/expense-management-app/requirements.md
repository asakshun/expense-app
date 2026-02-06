# 要件定義書

## はじめに

本書は、LINE Messaging APIを使用した支出入力と、LINE LIFF（LINE Front-end Framework）を使用した設定管理・表示機能を統合した支出管理アプリケーションの要件を定義します。システムはNotionをバックエンドデータベースとして使用し、支出記録と設定情報を保存します。

## 用語集

- **System（システム）**: 支出管理アプリケーション
- **Messaging_API（メッセージングAPI）**: ユーザーからのテキストメッセージ入力を処理するLINE Messaging APIコンポーネント
- **LIFF_App（LIFFアプリ）**: 設定と表示のインターフェースを提供するLINE Front-end Frameworkアプリケーションコンポーネント
- **Notion_Expense_DB（Notion支出データベース）**: 日付と金額を含む支出記録を保存するNotionデータベース
- **Notion_Settings_DB（Notion設定データベース）**: 始まり日設定を含む設定情報を保存するNotionデータベース
- **Start_Day（始まり日）**: 支出追跡期間の開始日（1日または25日）
- **Valid_Numeric_Input（有効な数値入力）**: カンマ区切りの有無を問わず、単一の数値を含む文字列（例：「1000」、「1,000」）
- **Invalid_Input（無効な入力）**: 数値以外の文字を含む文字列、またはスペースや他の区切り文字で区切られた複数の数値
- **Current_Period（現在の期間）**: 始まり日設定に基づく支出計算の日付範囲
- **Total_Amount（合計額）**: 現在の期間内のすべての支出金額の合計

## 要件

### 要件1: Messaging APIによる支出入力

**ユーザーストーリー:** ユーザーとして、LINEメッセージで数値を送信して支出を記録したい。別のアプリを開かずに素早く支出を記録できるようにするため。

#### 受入基準

1. WHEN ユーザーがValid_Numeric_Inputを送信したとき、THE Messaging_API SHALL 数値を抽出し、現在の日付とともにNotion_Expense_DBに記録しなければならない
2. WHEN System が支出の記録に成功したとき、THE Messaging_API SHALL ユーザーに成功メッセージを返信しなければならない
3. IF ユーザーがInvalid_Inputを送信したとき、THEN THE Messaging_API SHALL エラーメッセージを返信し、データを記録してはならない

### 要件2: 始まり日の設定

**ユーザーストーリー:** ユーザーとして、支出追跡期間の開始日を設定したい。給与支払いスケジュールに合わせて支出追跡を調整できるようにするため。

#### 受入基準

1. WHEN ユーザーがLIFF_Appで始まり日スイッチを切り替えたとき、THE System SHALL Notion_Settings_DB内のStart_Day設定を更新しなければならない
2. THE System SHALL 2つのStart_Day値をサポートしなければならない：1（月の初日）と25（月の25日）

### 要件3: 支出期間の計算

**ユーザーストーリー:** ユーザーとして、始まり日設定に基づいて正しい期間の支出を自動的に計算してほしい。支払いサイクルに合わせた正確な月次合計を確認できるようにするため。

#### 受入基準

1. WHILE Start_Day設定が1であるとき、THE System SHALL 当月1日から当月末日までの期間のTotal_Amountを計算しなければならない
2. WHILE Start_Day設定が25であり、かつ現在の日付が1日から24日の間であるとき、THE System SHALL 前月25日から当月24日までの期間のTotal_Amountを計算しなければならない
3. WHILE Start_Day設定が25であり、かつ現在の日付が25日以降であるとき、THE System SHALL 当月25日から翌月24日までの期間のTotal_Amountを計算しなければならない

### 要件4: 支出の表示

**ユーザーストーリー:** ユーザーとして、LIFFアプリを開いたときに現在の期間の合計支出を確認したい。一目で支出を監視できるようにするため。

#### 受入基準

1. WHEN ユーザーがLIFF_Appを開いたとき、THE System SHALL Notion_Settings_DBからStart_Day設定を取得しなければならない
2. WHEN ユーザーがLIFF_Appを開いたとき、THE System SHALL Start_Day設定に基づいてCurrent_PeriodのTotal_Amountを計算し表示しなければならない
3. THE LIFF_App SHALL 個別の支出記録を表示せず、Total_Amountのみを表示しなければならない

### 要件5: 数値入力の解析

**ユーザーストーリー:** ユーザーとして、カンマ区切りの有無を問わず数値を入力したい。フォーマットを気にせず自然に支出を入力できるようにするため。

#### 受入基準

1. WHEN ユーザーがカンマ区切りの数値文字列（例：「1,000」）を送信したとき、THE System SHALL 数値を正しく抽出しなければならない
2. WHEN ユーザーがカンマ区切りなしの数値文字列（例：「1000」）を送信したとき、THE System SHALL 数値を正しく抽出しなければならない
3. THE System SHALL 両方のフォーマットを同等の数値として扱わなければならない

### 要件6: データの永続化

**ユーザーストーリー:** システム管理者として、すべての支出記録と設定をNotionデータベースに保存したい。データを一元化し、Notionのインターフェースからアクセスできるようにするため。

#### 受入基準

1. THE System SHALL 各支出記録を、最低限日付フィールドと金額フィールドを含めてNotion_Expense_DBに保存しなければならない
2. THE System SHALL Start_Day設定をNotion_Settings_DBに保存しなければならない
3. WHEN System がNotionデータベースに書き込むとき、THE System SHALL APIエラーを適切に処理し、失敗をユーザーに報告しなければならない
