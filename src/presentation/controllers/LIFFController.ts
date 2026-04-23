import { LIFFPresenter } from '../presenters/LIFFPresenter';
import { StartDay } from '../../domain/value-objects/Period';

export interface LIFFRequest {
  method: string;
  body?: any;
}

export interface LIFFResponse {
  statusCode: number;
  body: string;
}

export class LIFFController {
  constructor(private readonly presenter: LIFFPresenter) {}

  async getSummary(req: LIFFRequest): Promise<LIFFResponse> {
    try {
      if (req.method !== 'GET') {
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      }

      // Call presenter to get summary
      const summary = await this.presenter.getSummary();

      return {
        statusCode: 200,
        body: JSON.stringify(summary)
      };
    } catch (error) {
      console.error('Get summary error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'データの読み込みに失敗しました。' 
        })
      };
    }
  }

  async updateSettings(req: LIFFRequest): Promise<LIFFResponse> {
    try {
      if (req.method !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
      }

      const { startDay, budgetLimit } = req.body || {};
      if (startDay !== 1 && startDay !== 25) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '始まり日は1または25である必要があります。' })
        };
      }

      if (budgetLimit !== undefined && budgetLimit !== null) {
        if (typeof budgetLimit !== 'number' || !Number.isInteger(budgetLimit) || budgetLimit <= 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: '支出限度額は正の整数である必要があります。' })
          };
        }
      }

      const result = await this.presenter.updateSettings(startDay as StartDay, budgetLimit);
      if (result.success) {
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }
      return { statusCode: 500, body: JSON.stringify({ success: false, error: result.error }) };
    } catch (error) {
      console.error('Update settings error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。' })
      };
    }
  }

  async getCategories(req: LIFFRequest): Promise<LIFFResponse> {
    try {
      if (req.method !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      const result = await this.presenter.getCategories();
      return { statusCode: 200, body: JSON.stringify(result) };
    } catch (error) {
      console.error('Get categories error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'カテゴリの取得に失敗しました。' }) };
    }
  }

  async addCategory(req: LIFFRequest): Promise<LIFFResponse> {
    try {
      if (req.method !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      const { categoryName } = req.body || {};
      if (typeof categoryName !== 'string' || categoryName.trim().length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'カテゴリ名を入力してください。' }) };
      }
      const result = await this.presenter.addCategory(categoryName);
      if (result.success) {
        return { statusCode: 200, body: JSON.stringify({ success: true, customCategories: result.customCategories }) };
      }
      return { statusCode: 400, body: JSON.stringify({ success: false, error: result.error }) };
    } catch (error) {
      console.error('Add category error:', error);
      return { statusCode: 500, body: JSON.stringify({ success: false, error: '一時的なエラーが発生しました。' }) };
    }
  }

  async removeCategory(req: LIFFRequest): Promise<LIFFResponse> {
    try {
      if (req.method !== 'DELETE') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      const { categoryName } = req.body || {};
      if (typeof categoryName !== 'string' || categoryName.trim().length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'カテゴリ名を指定してください。' }) };
      }
      const result = await this.presenter.removeCategory(categoryName);
      if (result.success) {
        return { statusCode: 200, body: JSON.stringify({ success: true, customCategories: result.customCategories }) };
      }
      return { statusCode: 400, body: JSON.stringify({ success: false, error: result.error }) };
    } catch (error) {
      console.error('Remove category error:', error);
      return { statusCode: 500, body: JSON.stringify({ success: false, error: '一時的なエラーが発生しました。' }) };
    }
  }
}
