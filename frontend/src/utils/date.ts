export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(key: string, delta: number): string {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + delta)
  return toDateKey(date)
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function isBeforeToday(key: string): boolean {
  return key < todayKey()
}

export function formatLong(key: string): string {
  return fromDateKey(key).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function bookingDay(isoDate: string): string {
  return isoDate.slice(0, 10)
}

export function formatDayShort(key: string): string {
  return fromDateKey(key).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  })
}