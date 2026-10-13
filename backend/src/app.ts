import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiRouter from './routes/index.js'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { sanitizeInput } from './middleware/sanitize.js'
import { AppError } from './utils/AppError.js'

export const app = express()

// Oculta la cabecera X-Powered-By y agrega cabeceras de seguridad. El CORP se
// abre a cross-origin porque la API se consume desde el origen del frontend.
app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS restringido: solo los origenes configurados pueden leer las respuestas.
const allowedOrigins = (env.CORS_ORIGINS ?? env.WEB_BASE_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)

app.use(
  cors({
    origin(origin, callback) {
      // Requests sin cabecera Origin (curl, health checks, server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new AppError(403, 'Origen no permitido por CORS'))
    },
  })
)

app.use(express.json({ limit: '100kb' }))

// Corta payloads con operadores de Mongo ($ne, $gt) o rutas con punto antes
// de que lleguen a los controladores.
app.use(sanitizeInput)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)