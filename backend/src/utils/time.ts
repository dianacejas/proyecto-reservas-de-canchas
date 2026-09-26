export function dayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function parseDay(value: string): Date {
  return dayStart(new Date(`${value}T00:00:00.000Z`))
}