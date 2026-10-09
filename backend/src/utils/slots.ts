export const OPERATING_START_HOUR = 18
export const OPERATING_END_HOUR = 23

export interface HourSlot {
  start: string
  end: string
}

function pad(hour: number): string {
  return `${hour}`.padStart(2, '0')
}

export function buildHourSlots(startHour: number, endHour: number): HourSlot[] {
  const slots: HourSlot[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${pad(hour)}:00`
    const end = `${pad(hour + 1)}:00`
    slots.push({ start, end })
  }
  return slots
}

export const DAILY_SLOTS: HourSlot[] = buildHourSlots(OPERATING_START_HOUR, OPERATING_END_HOUR)