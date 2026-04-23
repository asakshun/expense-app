import { Client } from '@notionhq/client';
import { SettingsRepository } from '../../application/repositories/SettingsRepository';
import { Settings } from '../../domain/entities/Settings';
import { StartDay } from '../../domain/value-objects/Period';

/**
 * Notion APIを使用したSettingsRepositoryの実装
 */
export class NotionSettingsGateway implements SettingsRepository {
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 1000;
  private readonly settingsName = '始まり日';

  constructor(
    private readonly client: Client,
    private readonly databaseId: string
  ) {}

  /**
   * 設定をNotionデータベースから取得
   */
  async get(): Promise<Settings> {
    const response = await this.withRetry(async () => {
      return await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: '名前',
          title: {
            equals: this.settingsName,
          },
        },
      });
    });

    if (response.results.length === 0) {
      // 設定が存在しない場合、デフォルト値で作成
      const defaultSettings = Settings.create(1, null);
      await this.save(defaultSettings);
      return defaultSettings;
    }

    const page = response.results[0];
    return this.pageToSettings(page);
  }

  /**
   * 設定をNotionデータベースに保存
   */
  async save(settings: Settings): Promise<void> {
    const customCategoriesJson = JSON.stringify(settings.getCustomCategories());

    // 既存の設定ページを検索
    const response = await this.withRetry(async () => {
      return await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: '名前',
          title: {
            equals: this.settingsName,
          },
        },
      });
    });

    if (response.results.length > 0) {
      // 既存のページを更新
      const pageId = response.results[0].id;
      await this.withRetry(async () => {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            'startDay': {
              number: settings.getStartDay(),
            },
            'budgetLimit': {
              number: settings.getBudgetLimit(),
            },
            'customCategories': {
              rich_text: [{ text: { content: customCategoriesJson } }],
            },
          },
        });
      });
    } else {
      // 新しいページを作成
      await this.withRetry(async () => {
        await this.client.pages.create({
          parent: { database_id: this.databaseId },
          properties: {
            '名前': {
              title: [{ text: { content: this.settingsName } }],
            },
            'startDay': {
              number: settings.getStartDay(),
            },
            'budgetLimit': {
              number: settings.getBudgetLimit(),
            },
            'customCategories': {
              rich_text: [{ text: { content: customCategoriesJson } }],
            },
          },
        });
      });
    }
  }

  /**
   * NotionページをSettingsエンティティに変換
   */
  private pageToSettings(page: any): Settings {
    const id = page.id;

    const valueProperty = page.properties['startDay'];
    if (valueProperty?.type !== 'number' || typeof valueProperty.number !== 'number') {
      throw new Error('Invalid startDay property in settings');
    }

    const startDay = valueProperty.number as StartDay;
    if (startDay !== 1 && startDay !== 25) {
      throw new Error(`Invalid start day value: ${startDay}. Must be 1 or 25.`);
    }

    const budgetLimitProperty = page.properties['budgetLimit'];
    const budgetLimit = budgetLimitProperty?.type === 'number' ? budgetLimitProperty.number : null;

    const customCategoriesProperty = page.properties['customCategories'];
    let customCategories: string[] = [];
    if (customCategoriesProperty?.type === 'rich_text') {
      const text = customCategoriesProperty.rich_text?.[0]?.text?.content ?? '[]';
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) customCategories = parsed;
      } catch {
        // 既存レコードにプロパティがない場合は空配列のまま
      }
    }

    return Settings.reconstitute(id, startDay, budgetLimit, customCategories);
  }

  /**
   * リトライロジック付きでAPIコールを実行
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // レート制限エラーの場合
        if (error.code === 'rate_limited') {
          const retryAfter = error.headers?.['retry-after'];
          const delayMs = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : this.baseDelayMs * Math.pow(2, attempt);
          
          console.warn(`Rate limited. Retrying after ${delayMs}ms...`);
          await this.delay(delayMs);
          continue;
        }
        
        // その他のエラーで指数バックオフ
        if (attempt < this.maxRetries - 1) {
          const delayMs = this.baseDelayMs * Math.pow(2, attempt);
          console.warn(`Request failed. Retrying after ${delayMs}ms...`, error.message);
          await this.delay(delayMs);
          continue;
        }
      }
    }
    
    throw new Error(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * 指定されたミリ秒待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
