import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import { AppError } from '../utils/AppError.js'

export interface ValidatedInput {
  body?: unknown
  params?: unknown
  query?: unknown
}

declare global {
  namespace Express {
    interface Request {
      validData: ValidatedInput
    }
  }
}

export type ValidateSource = keyof ValidatedInput

export function validate(schema: ZodTypeAny, source: ValidateSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
      next(new AppError(400, 'Datos inválidos', issues))
      return
    }
    req.validData = { ...req.validData, [source]: result.data }
    next()
  }
}