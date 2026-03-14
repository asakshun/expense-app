import { StartDay } from '../value-objects/Period';
import { randomUUID } from 'crypto';

export class Settings {
  private constructor(
    private readonly id: string,
    private startDay: StartDay,
    private budgetLimit: number | null
  ) {}

  // Factory method to create a new Settings instance with a generated ID
  static create(startDay: StartDay, budgetLimit: number | null): Settings {
    const id = randomUUID();
    return new Settings(id, startDay, budgetLimit);
  }

  static reconstitute(id: string, startDay: StartDay, budgetLimit: number | null): Settings {
    return new Settings(id, startDay, budgetLimit);
  }

  getId(): string {
    return this.id;
  }

  getStartDay(): StartDay {
    return this.startDay;
  }

  getBudgetLimit(): number | null {
    return this.budgetLimit;
  }

  updateStartDay(newStartDay: StartDay): void {
    this.startDay = newStartDay;
  }

  updateBudgetLimit(newBudgetLimit: number | null): void {
    this.budgetLimit = newBudgetLimit;
  }
}
