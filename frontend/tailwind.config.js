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
        paper: '#f6f1ea',
        cream: '#fdfbf8',
        line: '#e8dfd4',
        coffeeElev: '#2a1b23',
        mauveDeep: '#35262d',

        // Alias semánticos (compatibilidad con roles UI)
        primary: '#c5d86d',
        'primary-foreground': '#1a090d',
        secondary: '#c57b57',
        'secondary-foreground': '#26130b',
        tertiary: '#52414c',
        'tertiary-foreground': '#f3efe8',
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