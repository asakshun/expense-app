import { Expense } from '../../domain/entities/Expense';
import { Period } from '../../domain/value-objects/Period';
import { Category } from '../../domain/value-objects/Category';

export interface ExpenseRepository {
  save(expense: Expense): Promise<string>;
  findByPeriod(period: Period): Promise<Expense[]>;
  updateCategory(recordId: string, category: Category): Promise<void>;
  findById(recordId: string): Promise<Expense | null>;
  update(expense: Expense): Promise<void>;
  delete(recordId: string): Promise<void>;
}
