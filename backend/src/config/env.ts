import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(10).default('dev-secret-canchas-2026'),
  JWT_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  PAYMENT_PROVIDER: z.enum(['sandbox', 'mercadopago']).default('sandbox'),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  WEB_BASE_URL: z.string().url().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Configuración de entorno inválida:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data