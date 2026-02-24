import { Client } from '@notionhq/client';
import { ExpenseRepository } from '../../application/repositories/ExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { Period } from '../../domain/value-objects/Period';
import { Amount } from '../../domain/value-objects/Amount';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { Category } from '../../domain/value-objects/Category';

/**
 * Notion APIを使用したExpenseRepositoryの実装
 */
export class NotionExpenseGateway implements ExpenseRepository {
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 1000;

  constructor(
    private readonly client: Client,
    private readonly databaseId: string
  ) {}

  /**
   * 支出をNotionデータベースに保存
   */
  async save(expense: Expense): Promise<string> {
    const response = await this.withRetry(async () => {
      return await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          '金額': {
            number: expense.getAmount().getValue(),
          },
          '日付': {
            date: {
              start: this.formatDate(expense.getDate().getValue()),
            },
          },
          'カテゴリ': {
            select: expense.getCategory() 
              ? { name: expense.getCategory()!.getValue() }
              : null
          }
        },
      });
    });
    return response.id;
  }

  /**
   * 期間内の支出をNotionデータベースから取得
   */
  async findByPeriod(period: Period): Promise<Expense[]> {
    const response = await this.withRetry(async () => {
      return await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          and: [
            {
              property: '日付',
              date: {
                on_or_after: this.formatDate(period.getStartDate()),
              },
            },
            {
              property: '日付',
              date: {
                on_or_before: this.formatDate(period.getEndDate()),
              },
            },
          ],
        },
      });
    });

    return response.results
      .map((page: any) => this.pageToExpense(page))
      .filter((expense: Expense | null): expense is Expense => expense !== null);
  }

  /**
   * レコードIDで支出を取得
   */
  async findById(recordId: string): Promise<Expense | null> {
    try {
      const page = await this.withRetry(async () => {
        return await this.client.pages.retrieve({ page_id: recordId });
      });
      return this.pageToExpense(page);
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 支出のカテゴリを更新
   */
  async updateCategory(recordId: string, category: Category): Promise<void> {
    await this.withRetry(async () => {
      await this.client.pages.update({
        page_id: recordId,
        properties: {
          'カテゴリ': {
            select: { name: category.getValue() }
          }
        }
      });
    });
  }

  /**
   * NotionページをExpenseエンティティに変換
   */
  private pageToExpense(page: any): Expense | null {
    try {
      const id = page.id;
      
      // 金額プロパティの取得
      const amountProperty = page.properties['金額'];
      if (amountProperty?.type !== 'number' || typeof amountProperty.number !== 'number') {
        console.error('Invalid amount property:', amountProperty);
        return null;
      }
      
      const amountResult = Amount.fromNumber(amountProperty.number);
      if (!amountResult.success) {
        console.error('Failed to create Amount:', amountResult.error);
        return null;
      }
      
      // 日付プロパティの取得
      const dateProperty = page.properties['日付'];
      if (dateProperty?.type !== 'date' || !dateProperty.date?.start) {
        console.error('Invalid date property:', dateProperty);
        return null;
      }
      
      const date = new Date(dateProperty.date.start);
      const expenseDate = ExpenseDate.fromDate(date);
      
      // カテゴリプロパティの取得（オプショナル）
      let category: Category | undefined;
      const categoryProperty = page.properties['カテゴリ'];
      if (categoryProperty?.type === 'select' && categoryProperty.select?.name) {
        const categoryResult = Category.fromString(categoryProperty.select.name);
        if (categoryResult.success) {
          category = categoryResult.value;
        }
      }
      
      return Expense.reconstitute(id, amountResult.value, expenseDate, category);
    } catch (error) {
      console.error('Error converting page to Expense:', error);
      return null;
    }
  }

  /**
   * DateをNotion API用の文字列形式に変換
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
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
