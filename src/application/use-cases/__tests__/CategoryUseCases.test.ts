import { Settings } from '../../../domain/entities/Settings';
import { SettingsRepository } from '../../repositories/SettingsRepository';
import { AddCategoryUseCaseImpl } from '../AddCategoryUseCase';
import { RemoveCategoryUseCaseImpl } from '../RemoveCategoryUseCase';
import { GetCategoriesUseCaseImpl } from '../GetCategoriesUseCase';

function makeSettings(customCategories: string[] = []): Settings {
  return Settings.reconstitute('test-id', 1, null, customCategories);
}

function makeRepository(settings: Settings): SettingsRepository {
  return {
    get: jest.fn().mockResolvedValue(settings),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

describe('AddCategoryUseCase', () => {
  it('カスタムカテゴリを追加できる', async () => {
    const settings = makeSettings([]);
    const repo = makeRepository(settings);
    const useCase = new AddCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '旅費' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.customCategories).toContain('旅費');
    }
    expect(repo.save).toHaveBeenCalled();
  });

  it('空文字は追加できない', async () => {
    const settings = makeSettings([]);
    const repo = makeRepository(settings);
    const useCase = new AddCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('1〜50文字');
    }
  });

  it('重複したカテゴリは追加できない', async () => {
    const settings = makeSettings(['旅費']);
    const repo = makeRepository(settings);
    const useCase = new AddCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '旅費' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('すでに登録');
    }
  });

  it('合計13個を超えると追加できない', async () => {
    // default 8 categories + 5 custom = 13 total → cannot add more
    const custom = ['A', 'B', 'C', 'D', 'E'];
    const settings = makeSettings(custom);
    const repo = makeRepository(settings);
    const useCase = new AddCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '新カテゴリ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('13個');
    }
  });
});

describe('RemoveCategoryUseCase', () => {
  it('カスタムカテゴリを削除できる', async () => {
    const settings = makeSettings(['旅費', '交際費']);
    const repo = makeRepository(settings);
    const useCase = new RemoveCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '旅費' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.customCategories).not.toContain('旅費');
      expect(result.customCategories).toContain('交際費');
    }
    expect(repo.save).toHaveBeenCalled();
  });

  it('存在しないカテゴリは削除できない', async () => {
    const settings = makeSettings(['旅費']);
    const repo = makeRepository(settings);
    const useCase = new RemoveCategoryUseCaseImpl(repo);

    const result = await useCase.execute({ categoryName: '存在しない' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('存在しません');
    }
  });
});

describe('GetCategoriesUseCase', () => {
  it('デフォルトカテゴリとカスタムカテゴリを返す', async () => {
    const settings = makeSettings(['旅費']);
    const repo = makeRepository(settings);
    const useCase = new GetCategoriesUseCaseImpl(repo);

    const result = await useCase.execute();

    expect(result.customCategories).toEqual(['旅費']);
    expect(result.defaultCategories.length).toBeGreaterThan(0);
    expect(result.allCategories.some(c => c.label === '旅費')).toBe(true);
    expect(result.allCategories.some(c => c.label === '食費')).toBe(true);
  });

  it('カスタムカテゴリが空の場合はデフォルトのみ返す', async () => {
    const settings = makeSettings([]);
    const repo = makeRepository(settings);
    const useCase = new GetCategoriesUseCaseImpl(repo);

    const result = await useCase.execute();

    expect(result.customCategories).toHaveLength(0);
    expect(result.allCategories).toEqual(result.defaultCategories);
  });
});
