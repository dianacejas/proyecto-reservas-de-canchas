import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().toLowerCase().email('El email es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('El email es inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>