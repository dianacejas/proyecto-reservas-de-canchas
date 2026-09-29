import { useMemo, useRef } from 'react'
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

  // RAC ancla el popover al DatePickerGroup (private/DatePicker.mjs:144), pero
  // HeroUI v3 no exporta ese Group, asi que su targetRef queda en null y
  // useOverlayPosition aborta el posicionamiento (useOverlayPosition.mjs:65):
  // el popover cae en top:0/left:0 sobre la navbar. Se le pasa el nodo del
  // trigger a mano para que si ancle.
  const triggerRef = useRef<HTMLButtonElement>(null)

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
        // El trigger trae width:100% de @heroui/styles y se estiraria al ancho
        // disponible dentro del flex-wrap de DateNav.
        className="w-auto shrink-0"
        onChange={(next) => {
          if (next === null) return
          onChange(next.toString().slice(0, 10))
        }}
      >
        <DatePicker.Trigger
          ref={triggerRef}
          aria-label="Elegir otra fecha"
          className="w-auto shrink-0 text-sm font-semibold"
        >
          {formatDayShort(date)}
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
        <DatePicker.Popover placement="bottom start" offset={8} triggerRef={triggerRef}>
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
