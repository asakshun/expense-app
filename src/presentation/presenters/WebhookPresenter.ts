import { RecordExpenseUseCase } from '../../application/use-cases/RecordExpenseUseCase';
import { UpdateExpenseCategoryUseCase } from '../../application/use-cases/UpdateExpenseCategoryUseCase';
import { GetCategoriesUseCase } from '../../application/use-cases/GetCategoriesUseCase';
import { CategoryOption } from '../../infrastructure/config/CategoryConfig';

export interface LineMessageEvent {
  type: 'message';
  message: {
    type: 'text';
    text: string;
  };
  replyToken: string;
}

export interface LinePostbackEvent {
  type: 'postback';
  postback: {
    data: string;
  };
  replyToken: string;
}

export interface LineQuickReplyItem {
  type: 'action';
  action: {
    type: 'postback';
    label: string;
    data: string;
    displayText: string;
  };
}

export interface LineReplyMessage {
  replyToken: string;
  messages: Array<{
    type: 'text';
    text: string;
    quickReply?: {
      items: LineQuickReplyItem[];
    };
  }>;
}

export interface WebhookPresenter {
  handleMessage(event: LineMessageEvent): Promise<LineReplyMessage>;
  handlePostback(event: LinePostbackEvent): Promise<LineReplyMessage>;
}

export class WebhookPresenterImpl implements WebhookPresenter {
  constructor(
    private readonly recordExpenseUseCase: RecordExpenseUseCase,
    private readonly updateExpenseCategoryUseCase: UpdateExpenseCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase
  ) {}

  async handleMessage(event: LineMessageEvent): Promise<LineReplyMessage> {
    // Extract text from message event
    const messageText = event.message.text;

    // Call RecordExpenseUseCase
    const result = await this.recordExpenseUseCase.execute({
      amountText: messageText
    });

    if (result.success) {
      const quickReply = await this.buildCategoryQuickReply(result.recordId);
      
      return {
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: result.message,
            quickReply
          }
        ]
      };
    } else {
      return {
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: result.error
          }
        ]
      };
    }
  }

  async handlePostback(event: LinePostbackEvent): Promise<LineReplyMessage> {
    // Parse postback data
    const postbackData = this.parsePostbackData(event.postback.data);
    
    if (!postbackData || !postbackData.recordId || !postbackData.category) {
      return {
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: 'エラーが発生しました。もう一度お試しください。'
          }
        ]
      };
    }

    // Execute category update use case
    const result = await this.updateExpenseCategoryUseCase.execute({
      recordId: postbackData.recordId,
      categoryText: postbackData.category
    });

    const responseText = result.success
      ? `${result.category}を記録しました: ${result.amount < 0 ? `-¥${Math.abs(result.amount).toLocaleString()}` : `¥${result.amount.toLocaleString()}`}`
      : result.error;

    return {
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: responseText
        }
      ]
    };
  }

  private async buildCategoryQuickReply(recordId: string): Promise<{ items: LineQuickReplyItem[] }> {
    let categories: CategoryOption[];
    try {
      const result = await this.getCategoriesUseCase.execute();
      categories = result.allCategories;
    } catch {
      // フォールバック: デフォルトカテゴリを使用
      const { CategoryConfig } = await import('../../infrastructure/config/CategoryConfig');
      categories = CategoryConfig.getCategories();
    }

    const items: LineQuickReplyItem[] = categories.map(category => ({
      type: 'action',
      action: {
        type: 'postback',
        label: category.label,
        data: `action=select_category&recordId=${recordId}&category=${category.label}`,
        displayText: category.label
      }
    }));

    return { items };
  }

  private parsePostbackData(data: string): { recordId: string; category: string } | null {
    try {
      const params = new URLSearchParams(data);
      const action = params.get('action');
      const recordId = params.get('recordId');
      const category = params.get('category');

      if (action === 'select_category' && recordId && category) {
        return { recordId, category };
      }
      return null;
    } catch (error) {
      console.error('Failed to parse postback data:', error);
      return null;
    }
  }
}
