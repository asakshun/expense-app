/**
 * Notion API設定
 */
export interface NotionConfig {
  apiKey: string;
  expenseDatabaseId: string;
  settingsDatabaseId: string;
}

/**
 * 環境変数からNotion設定を取得
 */
export function getNotionConfig(): NotionConfig {
  const apiKey = process.env.NOTION_API_KEY;
  const expenseDatabaseId = process.env.NOTION_EXPENSE_DATABASE_ID;
  const settingsDatabaseId = process.env.NOTION_SETTINGS_DATABASE_ID;

  if (!apiKey) {
    throw new Error('NOTION_API_KEY environment variable is required');
  }

  if (!expenseDatabaseId) {
    throw new Error('NOTION_EXPENSE_DATABASE_ID environment variable is required');
  }

  if (!settingsDatabaseId) {
    throw new Error('NOTION_SETTINGS_DATABASE_ID environment variable is required');
  }

  return {
    apiKey,
    expenseDatabaseId,
    settingsDatabaseId,
  };
}
