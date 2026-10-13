import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { AppError } from '../utils/AppError.js'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Recurso no encontrado: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message, details: err.details } })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([key, e]) => [key, e.message]))
    res.status(400).json({ error: { message: 'Datos inválidos', details } })
    return
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: { message: 'ID inválido' } })
    return
  }

  // `express.json()` (body-parser) lanza un SyntaxError con `type`
  // `entity.parse.failed` cuando el cuerpo no es JSON válido. Es un error del
  // cliente: debe responder 400 y no ensuciar los logs con un stack trace.
  if (
    err instanceof SyntaxError &&
    (err as { type?: unknown }).type === 'entity.parse.failed'
  ) {
    res.status(400).json({ error: { message: 'JSON inválido en el cuerpo de la petición' } })
    return
  }

  if (err && typeof err === 'object' && (err as { code?: unknown }).code === 11000) {
    res.status(409).json({
      error: {
        message: 'Conflicto: el recurso ya existe',
        details: (err as { keyPattern?: unknown }).keyPattern,
      },
    })
    return
  }

  console.error(err)
  res.status(500).json({ error: { message: 'Error interno del servidor' } })
}