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
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      }

      // Validate request body
      const { startDay } = req.body || {};
      if (startDay !== 1 && startDay !== 25) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: '始まり日は1または25である必要があります。' 
          })
        };
      }

      // Call presenter to update settings
      const result = await this.presenter.updateStartDay(startDay as StartDay);

      if (result.success) {
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            success: false, 
            error: result.error 
          })
        };
      }
    } catch (error) {
      console.error('Update settings error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false,
          error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。' 
        })
      };
    }
  }
}
