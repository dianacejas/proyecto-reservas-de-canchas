import { Button, Chip } from '@heroui/react'
import { addDays, formatDayShort, formatLong, isBeforeToday, todayKey } from '../../utils/date'

interface DateNavProps {
  date: string
  onChange: (date: string) => void
}

export default function DateNav({ date, onChange }: DateNavProps): React.JSX.Element {
  const canGoBack = !isBeforeToday(addDays(date, -1))
  const isToday = date === todayKey()

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
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          min={todayKey()}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-1.5 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
        />
      </div>
    </div>
  )
}