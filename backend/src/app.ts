import express from 'express'
import cors from 'cors'
import apiRouter from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { sanitizeInput } from './middleware/sanitize.js'

export const app = express()

app.use(cors())
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