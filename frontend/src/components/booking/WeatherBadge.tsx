import { useQuery } from '@tanstack/react-query'
import { AlertTriangleIcon, CloudIcon, CloudRainIcon, SunIcon } from '../common/Icons'

interface WeatherBadgeProps {
  selectedDate: string // YYYY-MM-DD
  isCovered?: boolean
}

interface DailyWeatherResponse {
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
}

async function fetchWeather(): Promise<DailyWeatherResponse> {
  const res = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=-31.4201&longitude=-64.1888&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FArgentina%2FCordoba'
  )
  if (!res.ok) throw new Error('Error al consultar clima')
  return res.json()
}

function getWeatherCondition(code: number): { label: string; isRain: boolean; type: 'sun' | 'cloud' | 'rain' } {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 80, 81, 82: Rain showers
  // 95, 96, 99: Thunderstorm
  if (code === 0 || code === 1) return { label: 'Despejado', isRain: false, type: 'sun' }
  if (code === 2 || code === 3 || code === 45 || code === 48) return { label: 'Nublado', isRain: false, type: 'cloud' }
  if (code >= 51) return { label: 'Lluvia probable', isRain: true, type: 'rain' }
  return { label: 'Parcial', isRain: false, type: 'sun' }
}

export default function WeatherBadge({
  selectedDate,
  isCovered = true,
}: WeatherBadgeProps): React.JSX.Element | null {
  const { data } = useQuery({
    queryKey: ['weather', selectedDate],
    queryFn: fetchWeather,
    staleTime: 1000 * 60 * 30,
  })

  if (!data?.daily) return null
  const index = data.daily.time.indexOf(selectedDate)
  if (index === -1) return null

  const code = data.daily.weather_code[index] ?? 0
  const maxTemp = Math.round(data.daily.temperature_2m_max[index] ?? 22)
  const rainProb = data.daily.precipitation_probability_max?.[index] ?? 0
  const condition = getWeatherCondition(code)
  const willRain = condition.isRain || rainProb >= 40

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Cápsula compacta clima */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-neutral-100 shadow-sm">
        {condition.type === 'sun' && <SunIcon className="size-4 text-amber-500" />}
        {condition.type === 'cloud' && <CloudIcon className="size-4 text-neutral-400" />}
        {condition.type === 'rain' && <CloudRainIcon className="size-4 text-sky-500" />}
        <span>{maxTemp}°C</span>
        <span className="text-mauve-soft">· {condition.label}</span>
      </div>

      {/* Alerta de lluvia para canchas descubiertas */}
      {willRain && !isCovered && (
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-amber-500/10 px-2.5 py-1 text-xs font-semibold border-amber-400/40 text-amber-300">
          <AlertTriangleIcon className="size-3.5 text-amber-400 shrink-0" />
          <span>Posibilidad de lluvia · Cancha sin techo</span>
        </div>
      )}
    </div>
  )
}
