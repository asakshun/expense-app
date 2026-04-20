import { StartDay } from '../value-objects/Period';
import { randomUUID } from 'crypto';

export const MAX_TOTAL_CATEGORIES = 13;

export class Settings {
  private constructor(
    private readonly id: string,
    private startDay: StartDay,
    private budgetLimit: number | null,
    private customCategories: string[]
  ) {}

  static create(startDay: StartDay, budgetLimit: number | null): Settings {
    return new Settings(randomUUID(), startDay, budgetLimit, []);
  }

  static reconstitute(
    id: string,
    startDay: StartDay,
    budgetLimit: number | null,
    customCategories: string[] = []
  ): Settings {
    return new Settings(id, startDay, budgetLimit, customCategories);
  }

  getId(): string {
    return this.id;
  }

  getStartDay(): StartDay {
    return this.startDay;
  }

  getBudgetLimit(): number | null {
    return this.budgetLimit;
  }

  getCustomCategories(): string[] {
    return [...this.customCategories];
  }

  updateStartDay(newStartDay: StartDay): void {
    this.startDay = newStartDay;
  }

  updateBudgetLimit(newBudgetLimit: number | null): void {
    this.budgetLimit = newBudgetLimit;
  }

  addCustomCategory(name: string, defaultCategoryCount: number): { success: true } | { success: false; error: string } {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 50) {
      return { success: false, error: 'カテゴリ名は1〜50文字で入力してください。' };
    }
    const all = [...this.customCategories];
    if (all.some(c => c === trimmed)) {
      return { success: false, error: `「${trimmed}」はすでに登録されています。` };
    }
    if (defaultCategoryCount + all.length >= MAX_TOTAL_CATEGORIES) {
      return { success: false, error: `カテゴリは合計${MAX_TOTAL_CATEGORIES}個まで登録できます。` };
    }
    this.customCategories = [...all, trimmed];
    return { success: true };
  }

  removeCustomCategory(name: string): { success: true } | { success: false; error: string } {
    const index = this.customCategories.indexOf(name);
    if (index === -1) {
      return { success: false, error: `「${name}」はカスタムカテゴリに存在しません。` };
    }
    this.customCategories = this.customCategories.filter(c => c !== name);
    return { success: true };
  }
}
