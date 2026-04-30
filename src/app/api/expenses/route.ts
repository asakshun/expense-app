import { NextRequest, NextResponse } from 'next/server';
import { Container } from '../../../infrastructure/di/Container';
import { Period } from '../../../domain/value-objects/Period';

export async function GET(request: NextRequest) {
  try {
    const container = Container.getInstance();
    const expenseGateway = container.getNotionExpenseGateway();
    const settingsGateway = container.getNotionSettingsGateway();

    const monthOffset = parseInt(request.nextUrl.searchParams.get('monthOffset') || '0');

    const settings = await settingsGateway.get();
    const startDay = settings.getStartDay();
    const period = Period.calculateForStartDay(startDay, new Date(), monthOffset);

    const expenses = await expenseGateway.findByPeriod(period);

    const sorted = [...expenses].sort(
      (a, b) => b.getDate().getValue().getTime() - a.getDate().getValue().getTime()
    );

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const start = period.getStartDate();
    const end = period.getEndDate();
    const periodText = `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;

    return NextResponse.json({
      expenses: sorted.map(e => ({
        id: e.getId(),
        amount: e.getAmount().getValue(),
        date: fmt(e.getDate().getValue()),
        category: e.getCategory()?.getValue(),
      })),
      periodText,
    });
  } catch (error) {
    console.error('[Expenses API] Error:', error);
    return NextResponse.json(
      { error: 'データの読み込みに失敗しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
