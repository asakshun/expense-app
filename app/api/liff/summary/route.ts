import { NextRequest, NextResponse } from 'next/server';
import { LIFFController } from '../../../../src/presentation/controllers/LIFFController';
import { Container } from '../../../../src/infrastructure/di/Container';

export async function GET(request: NextRequest) {
  try {
    // DIコンテナから依存関係を取得
    const container = Container.getInstance();
    const presenter = container.getLIFFPresenter();
    
    // LIFFControllerを初期化
    const controller = new LIFFController(presenter);
    
    // サマリーを取得
    const response = await controller.getSummary({
      method: 'GET'
    });
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      { error: 'データの読み込みに失敗しました。' },
      { status: 500 }
    );
  }
}
