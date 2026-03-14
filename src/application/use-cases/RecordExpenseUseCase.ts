import { Amount } from '../../domain/value-objects/Amount';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { ExpenseRepository } from '../repositories/ExpenseRepository';

export interface RecordExpenseInput {
  amountText: string;
}

export type RecordExpenseOutput = 
  | { success: true; message: string; recordId: string }
  | { success: false; error: string };

export interface RecordExpenseUseCase {
  execute(input: RecordExpenseInput): Promise<RecordExpenseOutput>;
}

export class RecordExpenseUseCaseImpl implements RecordExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: RecordExpenseInput): Promise<RecordExpenseOutput> {
    // Create Amount from input text
    const amountResult = Amount.fromString(input.amountText);
    
    if (!amountResult.success) {
      return {
        success: false,
        error: `申し訳ございません。数値のみを入力してください。\n例: 1000 または 1,000`
      };
    }

    // Create Expense entity with current date
    const expense = Expense.create(amountResult.value, ExpenseDate.now());

    // Save to repository
    try {
      const recordId = await this.expenseRepository.save(expense);
      
      const amount = amountResult.value.getValue();
      const formatted = amount < 0
        ? `-¥${Math.abs(amount).toLocaleString()}`
        : `¥${amount.toLocaleString()}`;
      const label = amount < 0 ? '調整を記録しました' : '支出を記録しました';
      return {
        success: true,
        message: `${label}: ${formatted}`,
        recordId
      };
    } catch (error) {
      return {
        success: false,
        error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。'
      };
    }
  }
}
