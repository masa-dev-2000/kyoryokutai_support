const JST_TIME_ZONE = "Asia/Tokyo";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function partsOf(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: JST_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).map((part) => [part.type, part.value])
  );
}

export function jstDateParts(date: Date = new Date()): DateParts {
  const parts = partsOf(date);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

export function jstDateString(date: Date = new Date()): string {
  const { year, month, day } = jstDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function jstTimeHHMM(date: Date = new Date()): string {
  const parts = partsOf(date);
  return `${parts.hour}:${parts.minute}`;
}

export function jstMonthDay(date: Date = new Date()): string {
  const { month, day } = jstDateParts(date);
  return `${month}/${day}`;
}

export function jstYearMonth(offset = 0, date: Date = new Date()): string {
  const { year, month } = jstDateParts(date);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function jstFiscalYear(date: Date = new Date()): string {
  const { year, month } = jstDateParts(date);
  return String(month >= 4 ? year : year - 1);
}
