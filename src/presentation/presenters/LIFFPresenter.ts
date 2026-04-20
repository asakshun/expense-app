import { GetExpenseSummaryUseCase } from '../../application/use-cases/GetExpenseSummaryUseCase';
import { UpdateSettingsUseCase } from '../../application/use-cases/UpdateSettingsUseCase';
import { GetCategoriesUseCase } from '../../application/use-cases/GetCategoriesUseCase';
import { AddCategoryUseCase } from '../../application/use-cases/AddCategoryUseCase';
import { RemoveCategoryUseCase } from '../../application/use-cases/RemoveCategoryUseCase';
import { CategoryOption } from '../../infrastructure/config/CategoryConfig';
import { StartDay } from '../../domain/value-objects/Period';

export interface SummaryViewModel {
  totalAmount: string;
  periodText: string;
  budgetLimit: string | null;
  remainingBudget: string | null;
  usageRate: number | null;
  isOverBudget: boolean | null;
}

export interface UpdateResult {
  success: boolean;
  error?: string;
}

export interface CategoriesViewModel {
  defaultCategories: CategoryOption[];
  customCategories: string[];
  allCategories: CategoryOption[];
}

export interface CategoryMutationResult {
  success: boolean;
  customCategories?: string[];
  error?: string;
}

export interface LIFFPresenter {
  getSummary(): Promise<SummaryViewModel>;
  updateSettings(startDay: StartDay, budgetLimit?: number | null): Promise<UpdateResult>;
  getCategories(): Promise<CategoriesViewModel>;
  addCategory(categoryName: string): Promise<CategoryMutationResult>;
  removeCategory(categoryName: string): Promise<CategoryMutationResult>;
}

export class LIFFPresenterImpl implements LIFFPresenter {
  constructor(
    private readonly getExpenseSummaryUseCase: GetExpenseSummaryUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly addCategoryUseCase: AddCategoryUseCase,
    private readonly removeCategoryUseCase: RemoveCategoryUseCase
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
      periodText,
      budgetLimit: result.budgetLimit !== null ? this.formatAmount(result.budgetLimit) : null,
      remainingBudget: result.budgetLimit !== null ? this.formatAmount(Math.abs(result.budgetLimit - result.totalAmount)) : null,
      usageRate: result.budgetLimit !== null ? Math.round((result.totalAmount / result.budgetLimit) * 100) : null,
      isOverBudget: result.budgetLimit !== null ? result.totalAmount > result.budgetLimit : null
    };
  }

  async updateSettings(startDay: StartDay, budgetLimit: number | null): Promise<UpdateResult> {
    const result = await this.updateSettingsUseCase.execute({ startDay, budgetLimit });
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  async getCategories(): Promise<CategoriesViewModel> {
    return this.getCategoriesUseCase.execute();
  }

  async addCategory(categoryName: string): Promise<CategoryMutationResult> {
    const result = await this.addCategoryUseCase.execute({ categoryName });
    if (result.success) {
      return { success: true, customCategories: result.customCategories };
    }
    return { success: false, error: result.error };
  }

  async removeCategory(categoryName: string): Promise<CategoryMutationResult> {
    const result = await this.removeCategoryUseCase.execute({ categoryName });
    if (result.success) {
      return { success: true, customCategories: result.customCategories };
    }
    return { success: false, error: result.error };
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
