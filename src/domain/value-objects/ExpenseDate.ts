export class ExpenseDate {
  private constructor(private readonly value: Date) {}

  static fromDate(date: Date): ExpenseDate {
    // Create a new Date to ensure immutability
    return new ExpenseDate(new Date(date.getTime()));
  }

  static now(): ExpenseDate {
    return new ExpenseDate(new Date());
  }

  getValue(): Date {
    // Return a copy to maintain immutability
    return new Date(this.value.getTime());
  }

  isBefore(other: ExpenseDate): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: ExpenseDate): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  equals(other: ExpenseDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
