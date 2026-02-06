import { createHmac } from 'crypto';
import { WebhookPresenter, LineMessageEvent } from '../presenters/WebhookPresenter';

export interface WebhookRequest {
  body: string;
  headers: {
    'x-line-signature'?: string;
  };
}

export interface WebhookResponse {
  statusCode: number;
  body: string;
}

export interface LineWebhookBody {
  events: Array<LineMessageEvent | { type: string }>;
}

export class WebhookController {
  constructor(
    private readonly presenter: WebhookPresenter,
    private readonly channelSecret: string
  ) {}

  async handleRequest(req: WebhookRequest): Promise<WebhookResponse> {
    try {
      // Verify LINE signature
      const signature = req.headers['x-line-signature'];
      if (!signature || !this.verifySignature(req.body, signature)) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }

      // Parse request body
      const webhookBody: LineWebhookBody = JSON.parse(req.body);

      // Process message events
      const replies = [];
      for (const event of webhookBody.events) {
        if (event.type === 'message' && 'message' in event && event.message.type === 'text') {
          const reply = await this.presenter.handleMessage(event as LineMessageEvent);
          replies.push(reply);
        }
      }

      // Return success response
      return {
        statusCode: 200,
        body: JSON.stringify({ replies })
      };
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  private verifySignature(body: string, signature: string): boolean {
    const hash = createHmac('sha256', this.channelSecret)
      .update(body)
      .digest('base64');
    return hash === signature;
  }
}
