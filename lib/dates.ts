import { addHours, format, parseISO, startOfDay } from "date-fns";

export function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export function endAfterHours(date: Date, hours: number) {
  return addHours(date, hours);
}

export function dateOnly(date: string) {
  return startOfDay(parseISO(date));
}

export function displayDate(value: Date | string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm");
}
