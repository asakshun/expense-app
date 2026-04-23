import { NextRequest, NextResponse } from 'next/server';
import { LIFFController } from '../../../presentation/controllers/LIFFController';
import { Container } from '../../../infrastructure/di/Container';

export async function GET(request: NextRequest) {
  try {
    console.log('[Summary API] Request received');
    
    // DIコンテナから依存関係を取得
    const container = Container.getInstance();
    console.log('[Summary API] Container initialized');
    
    const presenter = container.getLIFFPresenter();
    console.log('[Summary API] Presenter retrieved');
    
    // LIFFControllerを初期化
    const controller = new LIFFController(presenter);
    console.log('[Summary API] Controller initialized');
    
    // サマリーを取得
    const response = await controller.getSummary({
      method: 'GET'
    });
    console.log('[Summary API] Response:', response);
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Summary API] Error:', error);
    console.error('[Summary API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'データの読み込みに失敗しました。',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
