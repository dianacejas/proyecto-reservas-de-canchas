# Copa 5

> **Plataforma SaaS integral para la gestión de complejos deportivos, reservas de canchas en tiempo real y organización de torneos.**

[![CI](https://github.com/dianacejas/proyecto-reservas-de-canchas/actions/workflows/ci.yml/badge.svg)](https://github.com/dianacejas/proyecto-reservas-de-canchas/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=nodedotjs&logoColor=fff)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=fff)

---

## Características Principales

- 🕒 **Grilla de Reservas en Tiempo Real:** Visualización interactiva de turnos disponibles, estados dinámicos actualizados por servidor (SSE), soporte de señas o pago total y experiencia móvil optimizada como PWA.
- 🏆 **Módulo de Torneos y Playoffs:** Cálculo automático de tablas de posiciones, rankings de goleadores, sanciones, minuta de partidos, fixture por jornadas y llaves eliminatorias de fase final.
- 📊 **Panel de Administración Financiera:** Métricas diarias de recaudación (mostrador y pasarela), saldos por cobrar, tasa de ocupación, gestión integral de canchas y clientes, y exportación optimizada a **PDF** y **CSV**.
- 🌙 **Diseño Dark SaaS:** Interfaz inmersiva en modo oscuro estricto de alto contraste, diseñada con tipografía clara, jerarquía visual limpia y componentes accesibles.

---

## Stack Tecnológico

### Frontend
- **React 19** + **TypeScript** + **Vite** (con soporte PWA)
- **Tailwind CSS v4** & **HeroUI v3**
- **TanStack Query v5** para gestión de estado asíncrono y caché
- **React Router v7** para enrutamiento SPA

### Backend
- **Node.js 24.x** + **Express 5** (TypeScript)
- **Mongoose 9** para modelado de datos y consultas optimizadas
- **Zod** para validación estricta de esquemas, payloads y variables de entorno
- **JWT**, **Helmet**, **CORS** y **Rate Limiting** (con soporte opcional de Redis)
- **Pasarela de Pagos:** Integración con Mercado Pago (Checkout Pro / Webhook) y modo `sandbox` para entorno local

### Base de Datos
- **MongoDB** (persistencia principal de canchas, reservas, pagos, torneos, equipos y comunidad)

---

## Guía de Instalación y Configuración Local

### Requisitos previos
- **Node.js 24.x** y **npm**
- **MongoDB** en ejecución (local en `127.0.0.1:27017` o instancia dedicada)
- **Redis** *(opcional)*: para compartir rate limiting entre múltiples instancias

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-canchas
```

### 2. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

Copia la plantilla de ejemplo del backend y completa los valores correspondientes para tu entorno local:

```bash
cd ../backend
cp .env.example .env
```

Ejemplo seguro de `.env.example` (nunca subas tu `.env` real al repositorio):

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/canchas

# Clave secreta para firmar JWT (obligatoria; generar una aleatoria en local)
JWT_SECRET=
JWT_EXPIRES_IN_DAYS=7

# Pasarela de pagos: "sandbox" (simulada) o "mercadopago"
PAYMENT_PROVIDER=sandbox
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# URLs de frontend y CORS
WEB_BASE_URL=http://localhost:5173
CORS_ORIGINS=

# Configuración operativa de reservas
PENDING_TTL_MINUTES=15
DEPOSIT_PERCENT=50
CANCEL_WINDOW_HOURS=4

# Opcional: Redis y SMTP
REDIS_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Copa 5 <no-reply@example.local>
```

### 4. Cargar datos iniciales (opcional)

```bash
cd backend
npm run seed
```

### 5. Iniciar el entorno de desarrollo

Ejecuta ambos servicios en terminales separadas:

```bash
# Terminal 1 — API Backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend SPA (http://localhost:5173)
cd frontend
npm run dev
```

### 6. Verificación de calidad y compilación

```bash
# Backend: chequeo de tipos, build y pruebas unitarias
cd backend
npm run typecheck
npm run build
npm test

# Frontend: linter y build de producción
cd ../frontend
npm run lint
npm run build
```

---

## Estructura del Proyecto

```text
proyecto-canchas/
├── backend/                     # API REST & SSE en Express + TypeScript
│   ├── src/
│   │   ├── config/              # Conexión a MongoDB/Redis y validación env con Zod
│   │   ├── controllers/         # Controladores (auth, reservas, canchas, torneos, pagos, comunidad)
│   │   ├── middleware/          # Autenticación JWT, validación Zod, rate limiting y manejo de errores
│   │   ├── models/              # Modelos y esquemas Mongoose
│   │   ├── routes/              # Definición de rutas bajo /api
│   │   ├── schemas/             # Esquemas Zod reutilizables
│   │   ├── services/            # Lógica de negocio (reservas, SSE, pagos, standings, playoffs)
│   │   └── utils/               # Utilidades de fechas, tokens y helpers
│   └── .env.example             # Plantilla segura de variables de entorno
│
└── frontend/                    # Aplicación SPA / PWA en React 19 + TypeScript
    ├── public/                  # Íconos PWA y recursos estáticos
    └── src/
        ├── api/                 # Cliente HTTP y funciones tipadas con TanStack Query
        ├── auth/                # Contexto y protección de rutas por rol
        ├── components/          # Módulos UI (admin, booking, community, courts, layout, tournament)
        ├── pages/               # Vistas principales (Reservas, Torneos, Comunidad, Admin, Login)
        ├── types/               # Interfaces y tipos de dominio compartidos
        └── utils/               # Formateadores de moneda, fechas y utilidades UI
```
