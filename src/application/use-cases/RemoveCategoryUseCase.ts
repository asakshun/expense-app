import { SettingsRepository } from '../repositories/SettingsRepository';

export type RemoveCategoryInput = { categoryName: string };
export type RemoveCategoryOutput =
  | { success: true; customCategories: string[] }
  | { success: false; error: string };

export interface RemoveCategoryUseCase {
  execute(input: RemoveCategoryInput): Promise<RemoveCategoryOutput>;
}

export class RemoveCategoryUseCaseImpl implements RemoveCategoryUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(input: RemoveCategoryInput): Promise<RemoveCategoryOutput> {
    try {
      const settings = await this.settingsRepository.get();
      const result = settings.removeCustomCategory(input.categoryName);

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
