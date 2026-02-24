export type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class Amount {
  private constructor(private readonly value: number) {}

  static fromString(input: string): Result<Amount, ParseError> {
    // Remove all commas
    const normalized = input.replace(/,/g, '');
    
    // Check if empty
    if (normalized.trim() === '') {
      return {
        success: false,
        error: new ParseError('Input cannot be empty')
      };
    }
    
    // Check if it contains only digits (and optional decimal point)
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
      return {
        success: false,
        error: new ParseError('Input must contain only numeric characters')
      };
    }
    
    // Check for multiple numbers (spaces or other separators)
    if (/\s/.test(input)) {
      return {
        success: false,
        error: new ParseError('Input must contain a single number')
      };
    }
    
    const numValue = parseFloat(normalized);
    
    if (isNaN(numValue)) {
      return {
        success: false,
        error: new ParseError('Invalid number format')
      };
    }
    
    if (numValue < 0) {
      return {
        success: false,
        error: new ParseError('Amount must be 0 or greater')
      };
    }
    
    return {
      success: true,
      value: new Amount(numValue)
    };
  }

  static fromNumber(value: number): Result<Amount, ValidationError> {
    if (value < 0) {
      return {
        success: false,
        error: new ValidationError('Amount must be 0 or greater')
      };
    }
    
    if (!Number.isFinite(value)) {
      return {
        success: false,
        error: new ValidationError('Amount must be a finite number')
      };
    }
    
    return {
      success: true,
      value: new Amount(value)
    };
  }

  getValue(): number {
    return this.value;
  }

  add(other: Amount): Amount {
    return new Amount(this.value + other.value);
  }

  equals(other: Amount): boolean {
    return this.value === other.value;
  }
}
