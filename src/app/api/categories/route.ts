import { NextRequest, NextResponse } from 'next/server';
import { LIFFController } from '../../../presentation/controllers/LIFFController';
import { Container } from '../../../infrastructure/di/Container';

function getController(): LIFFController {
  const container = Container.getInstance();
  return new LIFFController(container.getLIFFPresenter());
}

export async function GET(request: NextRequest) {
  try {
    const controller = getController();
    const response = await controller.getCategories({ method: 'GET' });
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'カテゴリの取得に失敗しました。' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getController();
    const response = await controller.addCategory({ method: 'POST', body });
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ success: false, error: '一時的なエラーが発生しました。' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getController();
    const response = await controller.removeCategory({ method: 'DELETE', body });
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ success: false, error: '一時的なエラーが発生しました。' }, { status: 500 });
  }
}
