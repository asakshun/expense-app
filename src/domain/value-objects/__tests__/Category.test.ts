import * as fc from 'fast-check';
import { Category, ValidationError } from '../Category';

describe('Category Value Object', () => {
  describe('Unit Tests', () => {
    describe('fromString', () => {
      it('should create a Category from a valid string', () => {
        const result = Category.fromString('食費');
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value.getValue()).toBe('食費');
        }
      });

      it('should trim whitespace from input', () => {
        const result = Category.fromString('  交通費  ');
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value.getValue()).toBe('交通費');
        }
      });

      it('should reject empty string', () => {
        const result = Category.fromString('');
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('カテゴリは空にできません');
        }
      });

      it('should reject whitespace-only string', () => {
        const result = Category.fromString('   ');
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('カテゴリは空にできません');
        }
      });

      it('should reject string longer than 50 characters', () => {
        const longString = 'a'.repeat(51);
        const result = Category.fromString(longString);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('カテゴリは50文字以内で指定してください');
        }
      });

      it('should accept string with exactly 50 characters', () => {
        const fiftyChars = 'a'.repeat(50);
        const result = Category.fromString(fiftyChars);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value.getValue()).toBe(fiftyChars);
        }
      });

      it('should accept string with 1 character', () => {
        const result = Category.fromString('a');
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value.getValue()).toBe('a');
        }
      });
    });

    describe('getValue', () => {
      it('should return the category value', () => {
        const result = Category.fromString('娯楽費');
        
        if (result.success) {
          expect(result.value.getValue()).toBe('娯楽費');
        }
      });
    });

    describe('equals', () => {
      it('should return true for equal categories', () => {
        const result1 = Category.fromString('食費');
        const result2 = Category.fromString('食費');
        
        if (result1.success && result2.success) {
          expect(result1.value.equals(result2.value)).toBe(true);
        }
      });

      it('should return false for different categories', () => {
        const result1 = Category.fromString('食費');
        const result2 = Category.fromString('交通費');
        
        if (result1.success && result2.success) {
          expect(result1.value.equals(result2.value)).toBe(false);
        }
      });

      it('should handle trimmed values correctly', () => {
        const result1 = Category.fromString('食費');
        const result2 = Category.fromString('  食費  ');
        
        if (result1.success && result2.success) {
          expect(result1.value.equals(result2.value)).toBe(true);
        }
      });
    });
  });

  describe('Property-Based Tests', () => {
    it('should accept any non-empty string with length <= 50', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (str) => {
            const result = Category.fromString(str);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject any string longer than 50 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 100 }).filter(s => s.trim().length > 50),
          (str) => {
            const result = Category.fromString(str);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.message).toBe('カテゴリは50文字以内で指定してください');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain value equality (reflexive)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (str) => {
            const result = Category.fromString(str);
            if (result.success) {
              expect(result.value.equals(result.value)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain value equality (symmetric)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (str) => {
            const result1 = Category.fromString(str);
            const result2 = Category.fromString(str);
            
            if (result1.success && result2.success) {
              expect(result1.value.equals(result2.value)).toBe(true);
              expect(result2.value.equals(result1.value)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve value through getValue', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (str) => {
            const result = Category.fromString(str);
            if (result.success) {
              expect(result.value.getValue()).toBe(str.trim());
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
