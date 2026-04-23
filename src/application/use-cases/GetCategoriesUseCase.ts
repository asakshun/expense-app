import { SettingsRepository } from '../repositories/SettingsRepository';
import { CategoryConfig, CategoryOption } from '../../infrastructure/config/CategoryConfig';

export interface GetCategoriesOutput {
  defaultCategories: CategoryOption[];
  customCategories: string[];
  allCategories: CategoryOption[];
}

export interface GetCategoriesUseCase {
  execute(): Promise<GetCategoriesOutput>;
}

export class GetCategoriesUseCaseImpl implements GetCategoriesUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(): Promise<GetCategoriesOutput> {
    const settings = await this.settingsRepository.get();
    const customCategories = settings.getCustomCategories();
    const defaultCategories = CategoryConfig.getCategories();
    const allCategories = CategoryConfig.mergeWithCustom(customCategories);

    return { defaultCategories, customCategories, allCategories };
  }
}
