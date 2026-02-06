import { StartDay } from '../value-objects/Period';
import { randomUUID } from 'crypto';

export class Settings {
  private constructor(
    private readonly id: string,
    private startDay: StartDay
  ) {}

  static create(startDay: StartDay): Settings {
    const id = randomUUID();
    return new Settings(id, startDay);
  }

  static reconstitute(id: string, startDay: StartDay): Settings {
    return new Settings(id, startDay);
  }

  getId(): string {
    return this.id;
  }

  getStartDay(): StartDay {
    return this.startDay;
  }

  updateStartDay(newStartDay: StartDay): void {
    this.startDay = newStartDay;
  }
}
