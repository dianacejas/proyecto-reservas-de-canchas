import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  PAYMENT_PROVIDER: z.enum(['sandbox', 'mercadopago']).default('sandbox'),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  WEB_BASE_URL: z.string().url().default('http://localhost:5173'),
  // Origenes permitidos por CORS, separados por coma. Si se omite se permite
  // unicamente WEB_BASE_URL. Ej: "https://copa5.com,https://www.copa5.com".
  CORS_ORIGINS: z.string().optional(),
  // Numero de saltos de proxy a confiar para leer la IP real (X-Forwarded-For).
  // Sin valor, Express no confia en el proxy (trust proxy = false). Detras de
  // Nginx/Cloudflare hay que indicar el numero de saltos (normalmente 1).
  TRUST_PROXY: z.string().optional(),
  // URL de Redis para compartir el store de rate limiting entre instancias.
  // Si se omite se usa el store en memoria (no compartido entre procesos).
  REDIS_URL: z.string().optional(),
  PENDING_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  DEPOSIT_PERCENT: z.coerce.number().int().min(1).max(100).default(50),
  CANCEL_WINDOW_HOURS: z.coerce.number().int().min(0).default(4),

  // Notificaciones transaccionales por email (opcional: si falta SMTP_HOST el
  // servicio queda deshabilitado y solo registra un log).
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Copa 5 <no-reply@copa5.local>'),
  MAIL_REPLY_TO: z.string().optional(),

  // Límites de peticiones por IP.
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  BOOKING_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Configuración de entorno inválida:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data