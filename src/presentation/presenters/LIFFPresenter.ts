import { GetExpenseSummaryUseCase } from '../../application/use-cases/GetExpenseSummaryUseCase';
import { UpdateSettingsUseCase } from '../../application/use-cases/UpdateSettingsUseCase';
import { StartDay } from '../../domain/value-objects/Period';

export interface SummaryViewModel {
  totalAmount: string; // Formatted (e.g., "¥1,000")
  periodText: string; // Period text (e.g., "2024/1/1 - 2024/1/31")
}

export interface UpdateResult {
  success: boolean;
  error?: string;
}

export interface LIFFPresenter {
  getSummary(): Promise<SummaryViewModel>;
  updateStartDay(startDay: StartDay): Promise<UpdateResult>;
}

export class LIFFPresenterImpl implements LIFFPresenter {
  constructor(
    private readonly getExpenseSummaryUseCase: GetExpenseSummaryUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase
  ) {}

  async getSummary(): Promise<SummaryViewModel> {
    // Call GetExpenseSummaryUseCase
    const result = await this.getExpenseSummaryUseCase.execute({});

    // Format amount with comma separator and currency symbol
    const formattedAmount = this.formatAmount(result.totalAmount);

    // Format period text
    const periodText = this.formatPeriod(result.period.startDate, result.period.endDate);

    return {
      totalAmount: formattedAmount,
      periodText
    };
  }

  async updateStartDay(startDay: StartDay): Promise<UpdateResult> {
    // Call UpdateSettingsUseCase
    const result = await this.updateSettingsUseCase.execute({ startDay });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  }

  private formatAmount(amount: number): string {
    // Format with comma separator and currency symbol
    const formatted = amount.toLocaleString('ja-JP');
    return `¥${formatted}`;
  }

  private formatPeriod(startDate: Date, endDate: Date): string {
    // Format as "YYYY/M/D - YYYY/M/D"
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}/${month}/${day}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
}
