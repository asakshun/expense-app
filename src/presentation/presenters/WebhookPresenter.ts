import { RecordExpenseUseCase } from '../../application/use-cases/RecordExpenseUseCase';

export interface LineMessageEvent {
  type: 'message';
  message: {
    type: 'text';
    text: string;
  };
  replyToken: string;
}

export interface LineReplyMessage {
  replyToken: string;
  messages: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface WebhookPresenter {
  handleMessage(event: LineMessageEvent): Promise<LineReplyMessage>;
}

export class WebhookPresenterImpl implements WebhookPresenter {
  constructor(private readonly recordExpenseUseCase: RecordExpenseUseCase) {}

  async handleMessage(event: LineMessageEvent): Promise<LineReplyMessage> {
    // Extract text from message event
    const messageText = event.message.text;

    // Call RecordExpenseUseCase
    const result = await this.recordExpenseUseCase.execute({
      amountText: messageText
    });

    // Convert result to LINE message format
    const responseText = result.success ? result.message : result.error;

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
}
