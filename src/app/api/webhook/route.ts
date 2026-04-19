import { NextRequest, NextResponse } from 'next/server';
import { Client, middleware } from '@line/bot-sdk';
import { WebhookController } from '../../../presentation/controllers/WebhookController';
import { Container } from '../../../infrastructure/di/Container';

/**
 * LINE Webhook エンドポイント
 * LINE Messaging APIからのWebhookリクエストを処理
 */
export async function POST(request: NextRequest) {
  try {
    // DIコンテナから依存関係を取得
    const container = Container.getInstance();
    const presenter = container.getWebhookPresenter();
    const lineConfig = container.getLineConfig();

    // LINE Bot SDKクライアントを初期化
    const lineClient = new Client({
      channelAccessToken: lineConfig.channelAccessToken,
    });

    // WebhookControllerを初期化
    const controller = new WebhookController(presenter, lineConfig.channelSecret);

    // リクエストボディを取得
    const body = await request.text();

    // LINE署名を取得
    const signature = request.headers.get('x-line-signature') || undefined;

    // Webhookリクエストを処理
    const response = await controller.handleRequest({
      body,
      headers: {
        'x-line-signature': signature
      }
    });

    // 成功した場合、LINE APIに返信を送信
    if (response.statusCode === 200) {
      const responseData = JSON.parse(response.body);
      
      // 各返信メッセージをLINE APIに送信
      for (const reply of responseData.replies || []) {
        try {
          await lineClient.replyMessage(reply.replyToken, reply.messages);
        } catch (error) {
          console.error('Failed to send LINE reply:', error);
        }
      }
    }

    // レスポンスを返却
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Webhook API error:', error);
    
    // エラーレスポンスを返却
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET リクエストのハンドラー（ヘルスチェック用）
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'Webhook endpoint is ready' },
    { status: 200 }
  );
}
