# Copa 5 — Plataforma de reservas y torneos

[![CI](https://github.com/dianacejas/proyecto-reservas-de-canchas/actions/workflows/ci.yml/badge.svg)](https://github.com/dianacejas/proyecto-reservas-de-canchas/actions/workflows/ci.yml)

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
- **Redis** (opcional): solo si querés compartir el rate limiting entre
  instancias o reinicios (`REDIS_URL`).

## Estructura

```
proyecto-canchas/
├── backend/    # API Express (puerto 4000) — TypeScript
│   ├── src/
│   │   ├── config/       # conexión a MongoDB/Redis y validación de entorno con zod
│   │   ├── controllers/  # auth, reservas, canchas, partidos, pagos, …
│   │   ├── middleware/   # autenticación, validación, rate limiting, sanitización y errores
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
| `MERCADO_PAGO_WEBHOOK_SECRET` | Clave para validar la firma del webhook de pagos (obligatoria en producción si `PAYMENT_PROVIDER=mercadopago`) | (vacío: no se valida la firma) |
| `WEB_BASE_URL`                | Origen del frontend, para los links de retorno del pago | `http://localhost:5173`                 |
| `CORS_ORIGINS`                | Orígenes permitidos por CORS, separados por coma (si se omite, solo `WEB_BASE_URL`) | (vacío) |
| `TRUST_PROXY`                 | Saltos de proxy a confiar para resolver la IP real (si se omite, ninguno) | (vacío) |
| `REDIS_URL`                   | Redis para compartir el rate limiting entre instancias (si se omite, memoria) | (vacío) |
| `SMTP_HOST`                   | Host SMTP para emails de confirmación                  | (vacío: envío deshabilitado)             |
| `SMTP_PORT`                   | Puerto SMTP                                            | `587`                                    |
| `SMTP_SECURE`                 | `true` para TLS implícito (puerto 465)                 | `false`                                  |
| `SMTP_USER` / `SMTP_PASS`     | Credenciales SMTP                                      | (vacío)                                  |
| `MAIL_FROM`                   | Remitente de los emails                                | `Copa 5 <no-reply@copa5.local>`          |
| `MAIL_REPLY_TO`               | Dirección de respuesta (opcional)                      | (vacío)                                  |
| `AUTH_RATE_LIMIT_MAX`         | Máximo de intentos de login/registro por minuto y por IP | `5`                                    |
| `BOOKING_RATE_LIMIT_MAX`      | Máximo de reservas por 15 minutos y por IP             | `10`                                     |

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

El seed crea usuarios de desarrollo con emails de ejemplo, pensados solo para
`localhost`:

| Rol       | Email de ejemplo       |
| --------- | ---------------------- |
| `admin`   | `admin@ejemplo.com`    |
| `cliente` | `cliente@ejemplo.com`  |

> Las credenciales se toman de `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`,
> `SEED_CLIENT_EMAIL` y `SEED_CLIENT_PASSWORD`. Si no definís las contraseñas,
> el seed genera una aleatoria por ejecución y la muestra por consola.

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

Cualquier otra ruta muestra una pantalla 404 temática con un botón para volver al inicio.

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

El flujo crea la reserva en estado `pendiente` y, según `PAYMENT_PROVIDER`:

- `sandbox`: crea un pago simulado y devuelve una URL de confirmación
  (`/pago/sandbox/:paymentId/confirmar`); al confirmarla, la reserva pasa a
  confirmada. Útil para desarrollo sin credenciales.
- `mercadopago`: crea la preferencia contra la API de Mercado Pago y devuelve el
  `initPoint` para redirigir al checkout. El servidor **recalcula el total** del
  lado del servidor; el importe del cliente no se toma como fuente de verdad.

Si no hay `MERCADO_PAGO_ACCESS_TOKEN`, el pago online queda deshabilitado y el
resto del flujo sigue funcionando. Nunca subes un token de producción al
repositorio.

Cuando Mercado Pago confirma un pago notifica al endpoint `POST /api/payments/webhook`.
El servidor verifica la firma `x-signature` (si `MERCADO_PAGO_WEBHOOK_SECRET`
está configurado), consulta el pago a la API de Mercado Pago y, si está
aprobado, marca el pago como pagado y confirma la reserva. En producción, con
`PAYMENT_PROVIDER=mercadopago`, el secreto es obligatorio: el servidor no
arranca si falta, para no aceptar webhooks sin firma.

Al confirmarse un pago se envía (si SMTP está configurado) un email con el
comprobante de la reserva: código, cancha, fecha, horario, importe abonado y
las reglas de convivencia. El envío es asíncrono: un fallo de SMTP no afecta la
confirmación.

## Notas de seguridad

- `.env` está ignorado por Git; solo se versiona `.env.example`.
- `JWT_SECRET` es obligatoria y no tiene valor por defecto.
- **CORS**: solo se permiten los orígenes de `CORS_ORIGINS` (o `WEB_BASE_URL`);
  el resto recibe un `403`. Se deshabilita `X-Powered-By` y se agregan cabeceras
  de seguridad con Helmet.
- **Errores**: un JSON inválido en el cuerpo responde `400`; los errores de las
  rutas protegidas devuelven `401`/`403`. Nunca se expone un stack trace de
  Node.js al cliente.
- Las contraseñas se almacenan con hash, nunca en claro.
- El rol se valida en el servidor: los endpoints de administración rechazan
  tokens sin `role: admin`, sin confiar en lo que la UI oculta.
- **Rate limiting**: login y registro están limitados a `AUTH_RATE_LIMIT_MAX`
  intentos por minuto y por IP; la creación de reservas, a
  `BOOKING_RATE_LIMIT_MAX` por cada 15 minutos. Los contadores viven en memoria
  por defecto; con `REDIS_URL` se comparten entre todas las instancias y
  sobreviven a los reinicios.
- **IP detrás de proxy**: si hay un reverse proxy delante (Nginx, Cloudflare),
  configurar `TRUST_PROXY` con el número de saltos para que el rate limiting
  cuente por cliente y no por la IP del proxy.
- **Sanitización NoSQL**: un middleware descarta claves con operadores (`$gt`,
  `$ne`, …) o puntos en `body`, `params` y `query` antes de que lleguen a
  Mongoose.
- Las imágenes de las canchas son de Pexels (libres de uso, sin atribución
  requerida).

## Licencia

MIT.
