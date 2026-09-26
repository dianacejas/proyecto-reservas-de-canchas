# Frontend — Copa 5 · Complejo Deportivo

Frontend de la plataforma de canchas de fútbol 5: grilla de reservas con pago
online, hub de torneos (posiciones y fixture) y panel de administración.

## Stack

- **React 19** + **TypeScript** y **Vite** (HMR).
- **Tailwind CSS v4** en modo CSS-first (plugin `@tailwindcss/vite`).
- **HeroUI v3** (`@heroui/react` + `@heroui/styles`) sin `<HeroUIProvider>`:
  los componentes se estilizan vía variables CSS y se importan los estilos con
  `@import '@heroui/styles'` en `src/index.css`.
- **TanStack Query** para el fetching de datos y **react-router-dom 7** para las
  rutas.

## Rutas

| Ruta           | Página                                          |
| -------------- | ----------------------------------------------- |
| `/`            | Reservas (galería de canchas + grilla de horarios) |
| `/torneos`     | Hub de torneos                                   |
| `/torneos/:id` | Detalle: posiciones + fixture (+ panel admin)    |
| `/admin`       | Panel de administración (solo rol `admin`)       |
| `/login`       | Ingreso / registro                              |

Cualquier otra ruta redirige a `/`.

## Estructura

```
src/
  pages/            ReservasPage, TorneosPage, TorneoPage, AdminPage, LoginPage
  components/
    brand/          Logo (trofeo "Copa 5")
    layout/         Navbar, Footer (leyenda de estados)
    courts/         CourtGallery (fotos de canchas de fútbol 5 en `public/images/canchas/`)
    booking/        FieldPicker, DateNav, BookingModal
    tournament/     StandingsTable, FixtureList, AdminPanel
    common/         Loading, ErrorState, AuthGuards
  hooks/            useDarkMode (oscuro por defecto)
  auth/             contexto de autenticación (JWT en localStorage `canchas.auth`)
  api/              cliente HTTP + hooks de TanStack Query
  utils/            helpers de fecha/hora
  types/            modelos compartidos
```

## Tema "Copa 5"

- **Oscuro por defecto** (`useDarkMode` si no hay preferencia guardada en
  `localStorage["canchas.theme"]`). La navbar permite alternar claro/oscuro.
- Paleta: coffee `#1a090d`, mauve `#52414c`, evergreen `#19381f`, lime
  `#c5d86d`, cinnamon `#c57b57`, con superficies `paper`/`cream`/`line`/
  `coffee-elev`/`mauve-deep`.
- **Token semánticos de HeroUI** sobreescritos en `src/index.css` (sin capa,
  para ganar a `@layer theme`): `--accent`, `--surface`, `--segment`,
  `--border`, `--default`, `--success`, `--warning`, `--danger`, `--focus`,
  `--overlay`, `--field-background`, etc., para los modos claro y oscuro. Los
  derivados (`-hover`, `-soft`, `background-secondary`) se recalculan solos con
  `color-mix` sobre esas bases.
- Utilidades de marca definidas en `src/index.css` (`@theme`) y duplicadas en
  `tailwind.config.js` (conectado vía `@config`): `bg-lime`, `text-coffee`,
  `border-mauve`, `bg-cream`, `fill-cinnamon`, etc.
- Para cambiar la paleta: edita las variables de `:root` (claro) y `.dark`
  (oscuro) en `src/index.css`. Acá conviene cuidar el contraste: el acento
  claro se usa oscurecido (`#b6c85c`) para cumplir AA.

## Imágenes del complejo

Las fotos de las canchas viven en `public/images/canchas/` (`nocturna.jpg`,
`indoor.jpg`, `techada.jpg`) y se usan en `CourtGallery`. Son imágenes de
**Pexels** (libres de uso, sin atribución requerida).

## Nota: tablas y colecciones de HeroUI v3

**No** uses `Table` de HeroUI dentro de un `Tabs.Panel`: en v3 ambos comparten
el contexto de colecciones y lanza "cannot be rendered outside a collection"
que desmonta toda la página. Las posiciones usan una `<table>` semántica
(`StandingsTable`) con la misma estética.

## Scripts

| Comando        | Qué hace                                  |
| -------------- | ----------------------------------------- |
| `npm run dev`  | Servidor de desarrollo de Vite (puerto 5173) |
| `npm run build`| `tsc -b && vite build` (falla si hay errores TS) |
| `npm run lint` | `oxlint` sobre el `src`                    |
| `npm run preview` | Sirve el build de producción            |

El backend espera: `http://localhost:4000` (ver la guía de inicio del
proyecto). Usuarios demo: admin `admin@canchas.com` / `admin123` · cliente
`juan@canchas.com` / `juan123`.