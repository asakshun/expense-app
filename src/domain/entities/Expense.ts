import { Amount } from '../value-objects/Amount';
import { ExpenseDate } from '../value-objects/ExpenseDate';
import { Period } from '../value-objects/Period';
import { Category } from '../value-objects/Category';
import { randomUUID } from 'crypto';

export class Expense {
  private constructor(
    private readonly id: string,
    private readonly amount: Amount,
    private readonly date: ExpenseDate,
    private readonly category?: Category
  ) {}

  static create(amount: Amount, date: ExpenseDate, category?: Category): Expense {
    const id = randomUUID();
    return new Expense(id, amount, date, category);
  }

  static reconstitute(id: string, amount: Amount, date: ExpenseDate, category?: Category): Expense {
    return new Expense(id, amount, date, category);
  }

  getId(): string {
    return this.id;
  }

  getAmount(): Amount {
    return this.amount;
  }

  getDate(): ExpenseDate {
    return this.date;
  }

  getCategory(): Category | undefined {
    return this.category;
  }

  withCategory(category: Category): Expense {
    return new Expense(this.id, this.amount, this.date, category);
  }

  isInPeriod(period: Period): boolean {
    return period.contains(this.date.getValue());
  }
}
