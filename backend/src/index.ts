import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { app } from './app.js'

async function start(): Promise<void> {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`Servidor en http://localhost:${env.PORT}`)
  })
}

start().catch((err) => {
  console.error('Error al iniciar el servidor:', err)
  process.exit(1)
})