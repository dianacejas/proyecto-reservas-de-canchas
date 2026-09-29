# Copa 5 — Plataforma de reservas y torneos

Aplicación web para un complejo de fútbol 5: permite reservas de canchas con
pago online y un hub de torneos con posiciones, fixture y playoffs. Incluye un
panel de administración protegido por rol.

- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS v4 y HeroUI v3.
- **Backend**: Express 5 + Mongoose 9, en TypeScript, con JWT.
- **Base de datos**: MongoDB local.
- **Pagos**: Checkout Pro de Mercado Pago y pasarela `sandbox` simulada.

## Requisitos previos

- **Node.js 24.x**
- **npm** (incluido con Node.js)
- **MongoDB** escuchando en `127.0.0.1:27017`.

## Estructura

```
proyecto-canchas/
├── backend/    # API Express (puerto 4000) — TypeScript
│   ├── src/
│   │   ├── config/       # conexión a MongoDB y validación de entorno con zod
│   │   ├── controllers/  # auth, reservas, canchas, partidos, pagos, …
│   │   ├── middleware/   # autenticación, validación y manejo de errores
│   │   ├── models/       # esquemas de Mongoose
│   │   ├── routes/       # endpoints bajo /api
│   │   ├── schemas/      # esquemas de validación zod
│   │   ├── services/     # lógica de reservas, partidos, playoffs y posiciones
│   │   └── utils/        # JWT, hashing, fechas y helpers
│   └── .env.example      # plantilla de configuración (copiar a .env)
└── frontend/   # SPA React (dev en el puerto 5173) — TypeScript
    ├── src/
    │   ├── pages/        # ReservasPage, TorneosPage, TorneoPage, AdminPage, LoginPage
    │   ├── components/   # booking, tournament, courts, admin, layout, …
    │   ├── auth/         # contexto de autenticación (JWT en localStorage)
    │   ├── api/          # cliente HTTP + hooks de TanStack Query
    │   └── utils/        # helpers de fecha/hora, horarios y paleta de escudos
    └── README.md         # detalle del frontend (tema, rutas, componentes)
```

## Puesta en marcha

### 1. Instalar dependencias

```bash
cd backend  && npm install
cd frontend && npm install
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env   # en Windows: copy .env.example .env
```

| Variable                      | Descripción                                            | Por defecto                              |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `NODE_ENV`                    | Entorno de ejecución                                   | `development`                            |
| `PORT`                        | Puerto del servidor Express                            | `4000`                                   |
| `MONGODB_URI`                 | Cadena de conexión a MongoDB                           | `mongodb://127.0.0.1:27017/canchas`      |
| `JWT_SECRET`                  | Clave para firmar los tokens                           | (obligatoria, sin valor por defecto)     |
| `JWT_EXPIRES_IN_DAYS`         | Vigencia del token                                      | `7`                                      |
| `PAYMENT_PROVIDER`            | `sandbox` (simulada) o `mercadopago`                   | `sandbox`                                |
| `MERCADO_PAGO_ACCESS_TOKEN`   | Access token de Mercado Pago (solo si `mercadopago`)   | (vacío: el pago online queda deshabilitado) |
| `WEB_BASE_URL`                | Origen del frontend, para los links de retorno del pago | `http://localhost:5173`                 |

> `JWT_SECRET` no tiene valor por defecto a propósito: sin ella el servidor
> arrancaría con una clave de firma conocida y cualquier token ajeno sería
> válido. Generá una con
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### 3. Sembrar datos de ejemplo (opcional)

Crea canchas, un torneo con dos grupos, partidos, y usuarios de prueba:

```bash
cd backend
npm run seed
```

El seed define usuarios de desarrollo con contraseñas fijas. Son credenciales
públicas de ejemplo, pensadas solo para `localhost`:

| Rol     | Email de ejemplo     | Contraseña de ejemplo |
| ------- | -------------------- | --------------------- |
| `admin` | `admin@ejemplo.com`  | `<cambiar>`           |
| `cliente` | `cliente@ejemplo.com` | `<cambiar>`         |

> Para tu entorno local, cambiá esos valores en `backend/src/seed.ts` antes de
> correrlo. No los subas al repositorio.

### 4. Ejecutar

En dos terminales:

```bash
# Terminal 1 — API en http://localhost:4000
cd backend
npm run dev
```

```bash
# Terminal 2 — frontend en http://localhost:5173
cd frontend
npm run dev
```

## Scripts

### Backend (`backend/`)

| Comando             | Qué hace                              |
| ------------------- | ------------------------------------- |
| `npm run dev`       | `tsx watch` sobre `src/index.ts`      |
| `npm run build`     | Compila a `dist/` con `tsc`           |
| `npm start`         | Ejecuta el build (`node dist/index.js`) |
| `npm run typecheck` | `tsc --noEmit`                        |
| `npm run seed`      | Carga los datos de ejemplo           |

### Frontend (`frontend/`)

| Comando           | Qué hace                                    |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo de Vite              |
| `npm run build`   | `tsc -b && vite build`                      |
| `npm run lint`    | `oxlint` sobre `src`                        |
| `npm run preview` | Sirve el build de producción                |

## Rutas del frontend

| Ruta           | Página                                          |
| -------------- | ----------------------------------------------- |
| `/`            | Reservas (galería de canchas + grilla de horarios) |
| `/torneos`     | Hub de torneos                                   |
| `/torneos/:id` | Detalle: posiciones, fixture, playoffs y panel admin |
| `/admin`       | Panel de administración (solo rol `admin`)       |
| `/login`       | Ingreso / registro                              |

Cualquier otra ruta redirige a `/`.

## API

El backend monta los recursos bajo `/api`:

| Ruta             | Recurso                                   |
| ---------------- | ----------------------------------------- |
| `/api/auth`      | Registro, login y perfil                  |
| `/api/fields`    | Canchas disponibles                       |
| `/api/bookings`  | Reservas y disponibilidad de horarios     |
| `/api/tournaments` | Torneos, posiciones y playoffs         |
| `/api/teams`     | Equipos y plantilla                       |
| `/api/matches`   | Partidos de la fixture                     |
| `/api/payments`  | Checkout de Mercado Pago y pasarela sandbox |

## Pagos

El flujo crea la reserva en estado `pending` y, según `PAYMENT_PROVIDER`:

- `sandbox`: devuelve un identificador de preferencia simulado y marca la reserva
  como confirmada, útil para desarrollo sin credenciales.
- `mercadopago`: crea la preferencia con el SDK oficial y redirige al
  `initPoint`. El servidor **recalcula el total** del lado del servidor; el
  importe del cliente no se toma como fuente de verdad.

Si no hay `MERCADO_PAGO_ACCESS_TOKEN`, el pago online queda deshabilitado y el
resto del flujo sigue funcionando. Nunca subes un token de producción al
repositorio.

## Notas de seguridad

- `.env` está ignorado por Git; solo se versiona `.env.example`.
- `JWT_SECRET` es obligatoria y no tiene valor por defecto.
- Las contraseñas se almacenan con hash, nunca en claro.
- El rol se valida en el servidor: los endpoints de administración rechazan
  tokens sin `role: admin`, sin confiar en lo que la UI oculta.
- Las imágenes de las canchas son de Pexels (libres de uso, sin atribución
  requerida).

## Licencia

MIT.
