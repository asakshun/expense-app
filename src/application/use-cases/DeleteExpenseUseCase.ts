import { ExpenseRepository } from '../repositories/ExpenseRepository';

export interface DeleteExpenseInput {
  recordId: string;
}

export type DeleteExpenseOutput =
  | { success: true; message: string }
  | { success: false; error: string };

export interface DeleteExpenseUseCase {
  execute(input: DeleteExpenseInput): Promise<DeleteExpenseOutput>;
}

export class DeleteExpenseUseCaseImpl implements DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: DeleteExpenseInput): Promise<DeleteExpenseOutput> {
    try {
      const expense = await this.expenseRepository.findById(input.recordId);
      if (!expense) {
        return { success: false, error: '指定されたレコードが見つかりません' };
      }

      await this.expenseRepository.delete(input.recordId);

      return { success: true, message: '支出を削除しました' };
    } catch {
      return { success: false, error: '一時的なエラーが発生しました。しばらくしてから再度お試しください。' };
    }
  }
}
