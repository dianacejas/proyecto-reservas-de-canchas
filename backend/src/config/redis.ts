import { createClient, type RedisClientType } from 'redis'
import { env } from './env.js'

let client: RedisClientType | null | undefined

function buildClient(): RedisClientType | null {
  if (env.REDIS_URL === undefined || env.REDIS_URL.length === 0) return null
  const created = createClient({ url: env.REDIS_URL })
  created.on('error', (error) => console.error('Error de Redis:', error))
  return created
}

/**
 * Devuelve el cliente de Redis si hay `REDIS_URL` configurada; si no, `null`.
 * El cliente se crea una sola vez (lazy).
 */
export function getRedisClient(): RedisClientType | null {
  if (client === undefined) client = buildClient()
  return client
}

/** Conecta a Redis (si esta configurado) antes de aceptar peticiones. */
export async function connectRedis(): Promise<void> {
  const redis = getRedisClient()
  if (redis && !redis.isOpen) {
    await redis.connect()
    console.log('Conectado a Redis')
  }
}
