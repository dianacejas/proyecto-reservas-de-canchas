import { AppError } from './AppError.js'

export function assertFound<T>(value: T, message = 'Recurso no encontrado'): NonNullable<T> {
  if (value === null || value === undefined) throw new AppError(404, message)
  return value as NonNullable<T>
}