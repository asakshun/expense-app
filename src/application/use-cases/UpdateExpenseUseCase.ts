import { Amount } from '../../domain/value-objects/Amount';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { Category } from '../../domain/value-objects/Category';
import { ExpenseRepository } from '../repositories/ExpenseRepository';

export interface UpdateExpenseInput {
  recordId: string;
  amountText: string;
  dateText: string;
  categoryText?: string;
}

export type UpdateExpenseOutput =
  | { success: true; message: string }
  | { success: false; error: string };

export interface UpdateExpenseUseCase {
  execute(input: UpdateExpenseInput): Promise<UpdateExpenseOutput>;
}

export class UpdateExpenseUseCaseImpl implements UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: UpdateExpenseInput): Promise<UpdateExpenseOutput> {
    try {
      const expense = await this.expenseRepository.findById(input.recordId);
      if (!expense) {
        return { success: false, error: '指定されたレコードが見つかりません' };
      }

      const amountResult = Amount.fromString(input.amountText);
      if (!amountResult.success) {
        return { success: false, error: '金額が無効です' };
      }

      const date = new Date(input.dateText);
      if (isNaN(date.getTime())) {
        return { success: false, error: '日付が無効です' };
      }
      const expenseDate = ExpenseDate.fromDate(date);

      let updated = expense.withAmount(amountResult.value).withDate(expenseDate);

      if (input.categoryText) {
        const categoryResult = Category.fromString(input.categoryText);
        if (!categoryResult.success) {
          return { success: false, error: categoryResult.error.message };
        }
        updated = updated.withCategory(categoryResult.value);
      }

      await this.expenseRepository.update(updated);

      return { success: true, message: '支出を更新しました' };
    } catch {
      return { success: false, error: '一時的なエラーが発生しました。しばらくしてから再度お試しください。' };
    }
  }
}
