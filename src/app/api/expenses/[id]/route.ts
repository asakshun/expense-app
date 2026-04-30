import { NextRequest, NextResponse } from 'next/server';
import { Container } from '../../../../infrastructure/di/Container';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const container = Container.getInstance();
    const result = await container.getUpdateExpenseUseCase().execute({
      recordId: id,
      amountText: String(body.amount),
      dateText: body.date,
      categoryText: body.category,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error) {
    console.error('[Expenses PUT] Error:', error);
    return NextResponse.json({ error: '更新に失敗しました。' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const container = Container.getInstance();
    const result = await container.getDeleteExpenseUseCase().execute({ recordId: id });

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error) {
    console.error('[Expenses DELETE] Error:', error);
    return NextResponse.json({ error: '削除に失敗しました。' }, { status: 500 });
  }
}
