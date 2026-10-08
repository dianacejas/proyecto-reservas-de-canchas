import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/jwt.js'

export interface AuthUser {
  id: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function parseBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return undefined
  const token = header.slice('Bearer '.length).trim()
  return token.length > 0 ? token : undefined
}

export function authRequired(req: Request, _res: Response, next: NextFunction): void {
  const token = parseBearerToken(req)
  if (!token) {
    next(new AppError(401, 'Se requiere autenticación'))
    return
  }
  const claims = verifyToken(token, env.JWT_SECRET)
  if (!claims) {
    next(new AppError(401, 'Sesión inválida o expirada'))
    return
  }
  req.user = { id: claims.sub, role: claims.role }
  next()
}

export function authOptional(req: Request, _res: Response, next: NextFunction): void {
  const token = parseBearerToken(req)
  if (token) {
    const claims = verifyToken(token, env.JWT_SECRET)
    if (claims) req.user = { id: claims.sub, role: claims.role }
  }
  next()
}

export function adminRequired(req: Request, res: Response, next: NextFunction): void {
  authRequired(req, res, (err?: unknown) => {
    if (err !== undefined) {
      next(err)
      return
    }
    if (req.user?.role !== 'admin') {
      next(new AppError(403, 'Acceso restringido a administradores'))
      return
    }
    next()
  })
}