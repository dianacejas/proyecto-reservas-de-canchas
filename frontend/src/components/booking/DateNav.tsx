import { useMemo } from 'react'
import { Button, Calendar, Chip, DatePicker } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { addDays, formatDayShort, formatLong, isBeforeToday, todayKey } from '../../utils/date'

interface DateNavProps {
  date: string
  onChange: (date: string) => void
}

export default function DateNav({ date, onChange }: DateNavProps): React.JSX.Element {
  const canGoBack = !isBeforeToday(addDays(date, -1))
  const isToday = date === todayKey()

  // React Aria memoiza el estado del calendario contra la identidad de estos
  // objetos: recrearlos en cada render resetea la navegacion entre meses.
  const selectedDate = useMemo(() => parseDate(date), [date])
  const minDate = useMemo(() => parseDate(todayKey()), [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        isDisabled={!canGoBack}
        onPress={() => {
          if (canGoBack) onChange(addDays(date, -1))
        }}
      >
        Día anterior
      </Button>
      <div className="min-w-44 rounded-xl border border-line bg-cream px-4 py-2 dark:border-mauve dark:bg-coffee-elev">
        <p className="text-base font-semibold capitalize text-coffee dark:text-[#f3efe8]">{formatLong(date)}</p>
        <p className="flex items-center gap-2 text-xs text-tertiary dark:text-mauve-soft">
          {formatDayShort(date)}
          {isToday && (
            <Chip color="accent" size="sm">
              Hoy
            </Chip>
          )}
        </p>
      </div>
      <Button variant="secondary" size="sm" onPress={() => onChange(addDays(date, 1))}>
        Día siguiente
      </Button>
      <DatePicker
        value={selectedDate}
        minValue={minDate}
        onChange={(next) => {
          if (next === null) return
          onChange(next.toString().slice(0, 10))
        }}
      >
        <DatePicker.Trigger aria-label="Elegir otra fecha" className="text-sm font-semibold">
          {formatDayShort(date)}
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
        <DatePicker.Popover>
          <Calendar>
            <Calendar.Header>
              <Calendar.NavButton slot="previous" />
              <Calendar.Heading />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid weekdayStyle="narrow">
              <Calendar.GridHeader>
                {(weekday) => <Calendar.HeaderCell>{weekday}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(day) => <Calendar.Cell date={day} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </div>
  )
}
