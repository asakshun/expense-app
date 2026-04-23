import { SettingsRepository } from '../repositories/SettingsRepository';
import { CategoryConfig } from '../../infrastructure/config/CategoryConfig';

export type AddCategoryInput = { categoryName: string };
export type AddCategoryOutput =
  | { success: true; customCategories: string[] }
  | { success: false; error: string };

export interface AddCategoryUseCase {
  execute(input: AddCategoryInput): Promise<AddCategoryOutput>;
}

export class AddCategoryUseCaseImpl implements AddCategoryUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(input: AddCategoryInput): Promise<AddCategoryOutput> {
    try {
      const settings = await this.settingsRepository.get();
      const defaultCount = CategoryConfig.getCategories().length;
      const result = settings.addCustomCategory(input.categoryName, defaultCount);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await this.settingsRepository.save(settings);
      return { success: true, customCategories: settings.getCustomCategories() };
    } catch {
      return { success: false, error: '一時的なエラーが発生しました。しばらくしてから再度お試しください。' };
    }
  }
}
