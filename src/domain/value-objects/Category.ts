export type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class Category {
  private constructor(private readonly value: string) {}

  static fromString(input: string): Result<Category, ValidationError> {
    const trimmed = input.trim();
    
    if (trimmed.length === 0) {
      return {
        success: false,
        error: new ValidationError('カテゴリは空にできません')
      };
    }
    
    if (trimmed.length > 50) {
      return {
        success: false,
        error: new ValidationError('カテゴリは50文字以内で指定してください')
      };
    }
    
    return {
      success: true,
      value: new Category(trimmed)
    };
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Category): boolean {
    return this.value === other.value;
  }
}
