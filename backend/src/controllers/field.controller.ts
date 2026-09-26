import { Field } from '../models/index.js'
import type { CreateFieldInput, IdParams, UpdateFieldInput } from '../schemas/index.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listFields = asyncHandler(async (req, res) => {
  const query = req.validData.query as { isActive?: string } | undefined
  const filter = query?.isActive !== undefined ? { isActive: query.isActive === 'true' } : {}
  const fields = await Field.find(filter).sort({ name: 1 })
  res.json({ data: fields })
})

export const getField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: assertFound(await Field.findById(id), 'Cancha no encontrada') })
})

export const createField = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateFieldInput
  res.status(201).json({ data: await Field.create(body) })
})

export const updateField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateFieldInput
  res.json({
    data: assertFound(await Field.findByIdAndUpdate(id, body, { new: true }), 'Cancha no encontrada'),
  })
})

export const removeField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: assertFound(await Field.findByIdAndDelete(id), 'Cancha no encontrada') })
})