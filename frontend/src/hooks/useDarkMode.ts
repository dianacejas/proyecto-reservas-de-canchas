import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'canchas.theme'

function readStoredTheme(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) !== 'light'
  } catch {
    return true
  }
}

export function useDarkMode(): { isDark: boolean; toggleDark: () => void } {
  const [isDark, setIsDark] = useState<boolean>(readStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    } catch {
      // almacenamiento no disponible
    }
  }, [isDark])

  const toggleDark = useCallback(() => setIsDark((current) => !current), [])

  return { isDark, toggleDark }
}