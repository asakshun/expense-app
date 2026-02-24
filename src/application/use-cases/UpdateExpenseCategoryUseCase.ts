import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { Category } from '../../domain/value-objects/Category';

export interface UpdateExpenseCategoryInput {
  recordId: string;
  categoryText: string;
}

export type UpdateExpenseCategoryOutput = 
  | { success: true; message: string; amount: number; category: string }
  | { success: false; error: string };

export interface UpdateExpenseCategoryUseCase {
  execute(input: UpdateExpenseCategoryInput): Promise<UpdateExpenseCategoryOutput>;
}

export class UpdateExpenseCategoryUseCaseImpl implements UpdateExpenseCategoryUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: UpdateExpenseCategoryInput): Promise<UpdateExpenseCategoryOutput> {
    // カテゴリの検証
    const categoryResult = Category.fromString(input.categoryText);
    if (!categoryResult.success) {
      return {
        success: false,
        error: categoryResult.error.message
      };
    }

    try {
      // レコードの存在確認
      const expense = await this.expenseRepository.findById(input.recordId);
      if (!expense) {
        return {
          success: false,
          error: '指定されたレコードが見つかりません'
        };
      }

      // カテゴリの更新
      await this.expenseRepository.updateCategory(input.recordId, categoryResult.value);

      return {
        success: true,
        message: `カテゴリを更新しました`,
        amount: expense.getAmount().getValue(),
        category: categoryResult.value.getValue()
      };
    } catch (error) {
      return {
        success: false,
        error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。'
      };
    }
  }
}
