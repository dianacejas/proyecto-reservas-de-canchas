import express from 'express'
import cors from 'cors'
import apiRouter from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)