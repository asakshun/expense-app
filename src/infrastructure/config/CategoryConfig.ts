/**
 * カテゴリオプション
 */
export interface CategoryOption {
  id: string;
  label: string;
}

/**
 * カテゴリ設定
 * 
 * デフォルトカテゴリリストを提供し、環境変数からのカスタマイズをサポートします。
 * 要件5.1, 5.2, 5.3, 5.4, 5.5に対応
 */
export class CategoryConfig {
  private static readonly DEFAULT_CATEGORIES: CategoryOption[] = [
    { id: 'food', label: '食費' },
    { id: 'transport', label: '交通費' },
    { id: 'entertainment', label: '娯楽費' },
    { id: 'utilities', label: '光熱費' },
    { id: 'shopping', label: '買い物' },
    { id: 'health', label: '医療費' },
    { id: 'education', label: '教育費' },
    { id: 'other', label: 'その他' }
  ];

  /**
   * カテゴリリストを取得
   * 
   * 環境変数EXPENSE_CATEGORIESが設定されている場合はそれを使用し、
   * 設定されていない場合はデフォルトカテゴリを返します。
   * カテゴリ数は5-13個の制限があります。
   * 
   * @returns カテゴリオプションの配列（5-13個）
   */
  static getCategories(): CategoryOption[] {
    const envCategories = process.env.EXPENSE_CATEGORIES;
    
    if (envCategories) {
      try {
        const parsed = JSON.parse(envCategories);
        
        if (Array.isArray(parsed) && parsed.length >= 5 && parsed.length <= 13) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse EXPENSE_CATEGORIES, using defaults');
      }
    }
    
    // デフォルトカテゴリを最大13個に制限して返す
    return this.DEFAULT_CATEGORIES.slice(0, 13);
  }

  /**
   * カテゴリIDからラベルを取得
   */
  static getCategoryLabel(id: string): string | undefined {
    return this.getCategories().find(c => c.id === id)?.label;
  }

  /**
   * デフォルトカテゴリを返す（環境変数上書き前の固定リスト）
   */
  static getDefaultCategories(): CategoryOption[] {
    return this.DEFAULT_CATEGORIES;
  }

  /**
   * デフォルトカテゴリとカスタムカテゴリをマージして返す
   * カスタムカテゴリは id = label として CategoryOption に変換する
   */
  static mergeWithCustom(customCategories: string[]): CategoryOption[] {
    const base = this.getCategories();
    const existingLabels = new Set(base.map(c => c.label));
    const custom: CategoryOption[] = customCategories
      .filter(name => !existingLabels.has(name))
      .map(name => ({ id: name, label: name }));
    return [...base, ...custom];
  }
}
