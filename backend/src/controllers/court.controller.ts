import { Field } from '../models/index.js'
import { idParamsSchema, updateCourtSchema } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const updateCourt = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de cancha inválido', paramsParsed.error.issues)
  }
  const bodyParsed = updateCourtSchema.safeParse(req.body)
  if (!bodyParsed.success) {
    throw new AppError(400, 'Datos de cancha inválidos', bodyParsed.error.issues)
  }

  const updateData = { ...bodyParsed.data }
  if (updateData.active !== undefined && updateData.isActive === undefined) {
    updateData.isActive = updateData.active
  }
  if (updateData.isActive !== undefined && updateData.active === undefined) {
    updateData.active = updateData.isActive
  }

  const updated = assertFound(
    await Field.findByIdAndUpdate(paramsParsed.data.id, updateData, { new: true }),
    'Cancha no encontrada'
  )
  res.json({ success: true, data: updated })
})
