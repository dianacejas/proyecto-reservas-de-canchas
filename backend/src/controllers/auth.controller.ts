import type { Response } from 'express'
import { env } from '../config/env.js'
import { User } from '../models/index.js'
import type { LoginInput, RegisterInput } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/jwt.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  })
}

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

  const authData = authResponse(user)
  setAuthCookie(res, authData.token)
  res.status(201).json({ success: true, data: authData })
})

export const login = asyncHandler(async (req, res) => {
  const body = req.validData.body as LoginInput

  const user = await User.findOne({ email: body.email })
  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw new AppError(401, 'Credenciales inválidas')
  }

  const authData = authResponse(user)
  setAuthCookie(res, authData.token)
  res.json({ success: true, data: authData })
})

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  res.json({ success: true, message: 'Sesión cerrada correctamente' })
})

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, 'Se requiere autenticación')
  const user = await User.findById(req.user.id).select('-passwordHash')
  if (!user) throw new AppError(404, 'Usuario no encontrado')
  res.json({ success: true, data: user.toJSON() })
})