/**
 * Copa 5 - Complejo Deportivo — Configuración de tema (Tailwind CSS v4)
 *
 * Tailwind v4 usa configuración CSS-first. Este archivo se adjunta al build
 * desde `src/index.css` mediante `@config '../tailwind.config.js'` y define
 * las "design tokens" de la marca. Los valores semánticos de los componentes
 * HeroUI (colores primarios, superficies, estados) se sobrescriben en
 * `index.css` sobre las variables CSS de `@heroui/styles` (ver `:root` y
 * `.dark` ahí), no en este archivo.
 *
 * Paleta:
 *   - Coffee Bean   #1a090d  (fondo oscuro / texto)
 *   - Mauve Shadow  #52414c  (superficies secundarias, bordes en dark)
 *   - Evergreen     #19381f  (éxito, posiciones clasificadas)
 *   - Lime Cream    #c5d86d  (acento, disponible, puesto 1)
 *   - Cinnamon Wood #c57b57  (pendiente, advertencias)
 */
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Paleta de marca
        coffee: '#1a090d',
        mauve: '#52414c',
        mauveSoft: '#a89a9f',
        evergreen: '#19381f',
        lime: '#c5d86d',
        cinnamon: '#c57b57',

        // Superficies y neutros de la app
        paper: '#f4f2ee',
        cream: '#ffffff',
        line: '#e7e5e4',
        coffeeElev: '#171717',
        mauveDeep: '#262626',

        // Alias semánticos (compatibilidad con roles UI)
        primary: '#c5d86d',
        'primary-foreground': '#0a0a0a',
        secondary: '#c57b57',
        'secondary-foreground': '#26130b',
        tertiary: '#737373',
        'tertiary-foreground': '#f5f5f5',
      },
      borderRadius: {
        field: 'calc(var(--radius) * 1.5)',
      },
      boxShadow: {
        surface: 'var(--surface-shadow)',
        overlay: 'var(--overlay-shadow)',
      },
    },
  },
}