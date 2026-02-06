import { Amount } from '../value-objects/Amount';
import { ExpenseDate } from '../value-objects/ExpenseDate';
import { Period } from '../value-objects/Period';
import { randomUUID } from 'crypto';

export class Expense {
  private constructor(
    private readonly id: string,
    private readonly amount: Amount,
    private readonly date: ExpenseDate
  ) {}

  static create(amount: Amount, date: ExpenseDate): Expense {
    const id = randomUUID();
    return new Expense(id, amount, date);
  }

  static reconstitute(id: string, amount: Amount, date: ExpenseDate): Expense {
    return new Expense(id, amount, date);
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

  isInPeriod(period: Period): boolean {
    return period.contains(this.date.getValue());
  }
}
