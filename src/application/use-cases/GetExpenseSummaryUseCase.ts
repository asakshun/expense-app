import { Amount } from '../../domain/value-objects/Amount';
import { Period } from '../../domain/value-objects/Period';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';

export type GetExpenseSummaryInput = {
  currentDate?: Date; // For testing purposes, defaults to now
}

export type GetExpenseSummaryOutput = {
  totalAmount: number;
  period: {
    startDate: Date;
    endDate: Date;
  },
  budgetLimit: number | null;
}

export interface GetExpenseSummaryUseCase {
  execute(input: GetExpenseSummaryInput): Promise<GetExpenseSummaryOutput>;
}

export class GetExpenseSummaryUseCaseImpl implements GetExpenseSummaryUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(input: GetExpenseSummaryInput): Promise<GetExpenseSummaryOutput> {
    // Get settings to retrieve start day
    const settings = await this.settingsRepository.get();
    const startDay = settings.getStartDay();

    // Calculate period based on start day and current date
    const currentDate = input.currentDate || new Date();
    const period = Period.calculateForStartDay(startDay, currentDate);

    // Get expenses within the period
    const expenses = await this.expenseRepository.findByPeriod(period);

    // Calculate total amount
    let totalAmount = 0;
    if (expenses.length > 0) {
      const initialResult = Amount.fromNumber(0);
      if (!initialResult.success) {
        throw new Error('Failed to initialize amount');
      }
      
      const total = expenses.reduce((sum, expense) => {
        return sum.add(expense.getAmount());
      }, initialResult.value);
      
      totalAmount = total.getValue();
    }

    return {
      totalAmount,
      period: {
        startDate: period.getStartDate(),
        endDate: period.getEndDate()
      },
      budgetLimit: settings.getBudgetLimit()
    };
  }
}
