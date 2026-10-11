import type { NextFunction, Request, Response } from 'express'

/**
 * Limpia recursivamente valores que podrían usarse para inyección NoSQL en
 * MongoDB: descarta claves que empiezan con `$` (operadores como `$gt`, `$ne`)
 * y claves que contienen `.` (acceso a rutas anidadas / prototype access).
 *
 * Se aplica a `body`, `params` y `query`. En Express 5 `req.query` es un getter
 * de solo lectura, así que se redefine con `Object.defineProperty`.
 */
function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue)

  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const clean: Record<string, unknown> = {}
    for (const key of Object.keys(source)) {
      if (key.startsWith('$') || key.includes('.')) continue
      clean[key] = sanitizeValue(source[key])
    }
    return clean
  }

  return value
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body !== undefined && req.body !== null) {
    req.body = sanitizeValue(req.body)
  }

  if (req.params !== undefined && req.params !== null) {
    req.params = sanitizeValue(req.params) as Request['params']
  }

  const query = sanitizeValue(req.query)
  Object.defineProperty(req, 'query', {
    value: query,
    writable: true,
    configurable: true,
    enumerable: true,
  })

  next()
}
