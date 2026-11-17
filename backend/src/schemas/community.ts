import { z } from 'zod'

const BAD_WORDS_REGEX =
  /\b(puto|puta|mierda|pelotud[oa]|bolud[oa]|conchud[oa]|concha|pija|verga|mogolic[oa]|forr[oa]|hdp|imbecil|idiota|tarad[oa]|cornud[oa]|sorete|culiad[oa]|orto|maricon|garca)\b/i

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isCleanText(value: string): boolean {
  return !BAD_WORDS_REGEX.test(normalizeText(value))
}

const OFFENSIVE_MSG = 'Tu aviso contiene términos no permitidos o lenguaje inadecuado'

export const createCommunityNoticeSchema = z.object({
  type: z.enum(['falta_uno', 'desafio_rival']),
  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100)
    .refine(isCleanText, { message: OFFENSIVE_MSG }),
  description: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500)
    .refine(isCleanText, { message: OFFENSIVE_MSG }),
  date: z.string().trim().min(1, 'La fecha es requerida'),
  timeSlot: z.string().trim().min(1, 'El horario es requerido'),
  courtName: z.string().trim().max(100).optional().default(''),
  contactPhone: z.string().trim().min(6, 'Ingresa un número de contacto válido').max(30),
  positionNeeded: z.string().trim().max(50).optional().default('Cualquiera'),
})

export type CreateCommunityNoticeInput = z.infer<typeof createCommunityNoticeSchema>
