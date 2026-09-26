import { env } from '../config/env.js'
import { User } from '../models/index.js'
import type { LoginInput, RegisterInput } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/jwt.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

function authResponse(user: InstanceType<typeof User>): { token: string; user: unknown } {
  const token = signToken({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, env.JWT_EXPIRES_IN_DAYS)
  return { token, user: user.toJSON() }
}

export const register = asyncHandler(async (req, res) => {
  const body = req.validData.body as RegisterInput

  const existing = await User.findOne({ email: body.email })
  if (existing) throw new AppError(409, 'El email ya está registrado')

  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: hashPassword(body.password),
    role: 'cliente',
  })

  res.status(201).json({ data: authResponse(user) })
})

export const login = asyncHandler(async (req, res) => {
  const body = req.validData.body as LoginInput

  const user = await User.findOne({ email: body.email })
  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw new AppError(401, 'Credenciales inválidas')
  }

  res.json({ data: authResponse(user) })
})

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, 'Se requiere autenticación')
  const user = await User.findById(req.user.id).select('-passwordHash')
  if (!user) throw new AppError(404, 'Usuario no encontrado')
  res.json({ data: user.toJSON() })
})