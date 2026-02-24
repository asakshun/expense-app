export type StartDay = 1 | 25;

export class Period {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {}

  static calculateForStartDay(startDay: StartDay, currentDate: Date): Period {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    const day = currentDate.getDate();

    if (startDay === 1) {
      // 当月1日から当月末日まで
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0); // Last day of current month
      return new Period(start, end);
    } else {
      // startDay === 25
      if (day >= 1 && day <= 24) {
        // 前月25日から当月24日まで
        const start = new Date(year, month - 1, 25);
        const end = new Date(year, month, 24);
        return new Period(start, end);
      } else {
        // day >= 25
        // 当月25日から翌月24日まで
        const start = new Date(year, month, 25);
        const end = new Date(year, month + 1, 24);
        return new Period(start, end);
      }
    }
  }

  getStartDate(): Date {
    return new Date(this.startDate.getTime());
  }

  getEndDate(): Date {
    return new Date(this.endDate.getTime());
  }

  contains(date: Date): boolean {
    const time = date.getTime();
    // Set times to start/end of day for proper comparison
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
    
    const periodStart = new Date(
      this.startDate.getFullYear(),
      this.startDate.getMonth(),
      this.startDate.getDate()
    ).getTime();
    
    const periodEnd = new Date(
      this.endDate.getFullYear(),
      this.endDate.getMonth(),
      this.endDate.getDate(),
      23, 59, 59, 999
    ).getTime();
    
    return startOfDay >= periodStart && endOfDay <= periodEnd;
  }
}
