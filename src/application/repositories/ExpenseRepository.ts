import { Expense } from '../../domain/entities/Expense';
import { Period } from '../../domain/value-objects/Period';

export interface ExpenseRepository {
  save(expense: Expense): Promise<void>;
  findByPeriod(period: Period): Promise<Expense[]>;
}
