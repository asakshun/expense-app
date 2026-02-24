import { NextRequest, NextResponse } from 'next/server';
import { LIFFController } from '../../../../src/presentation/controllers/LIFFController';
import { Container } from '../../../../src/infrastructure/di/Container';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // DIコンテナから依存関係を取得
    const container = Container.getInstance();
    const presenter = container.getLIFFPresenter();
    
    // LIFFControllerを初期化
    const controller = new LIFFController(presenter);
    
    // 設定を更新
    const response = await controller.updateSettings({
      method: 'POST',
      body
    });
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。' 
      },
      { status: 500 }
    );
  }
}
