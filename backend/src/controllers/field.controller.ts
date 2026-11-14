import { Field } from '../models/index.js'
import type { CreateFieldInput, IdParams, UpdateFieldInput } from '../schemas/index.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listFields = asyncHandler(async (req, res) => {
  const query = req.validData.query as { isActive?: string } | undefined
  const filter = query?.isActive !== undefined ? { isActive: query.isActive === 'true' } : {}
  const fields = await Field.find(filter).sort({ name: 1 }).lean()
  const data = fields.map((f) => ({ ...f, id: f._id.toString() }))
  res.json({ success: true, data })
})

export const getField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const field = assertFound(await Field.findById(id).lean(), 'Cancha no encontrada')
  res.json({ success: true, data: { ...field, id: field._id.toString() } })
})

export const createField = asyncHandler(async (req, res) => {
  const body = { ...(req.validData.body as CreateFieldInput) }
  const activeFlag = body.isActive ?? body.active ?? true
  body.active = activeFlag
  body.isActive = activeFlag
  res.status(201).json({ success: true, data: await Field.create(body) })
})

export const updateField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = { ...(req.validData.body as UpdateFieldInput) }
  if (body.active !== undefined && body.isActive === undefined) {
    body.isActive = body.active
  }
  if (body.isActive !== undefined && body.active === undefined) {
    body.active = body.isActive
  }
  res.json({
    success: true,
    data: assertFound(await Field.findByIdAndUpdate(id, body, { new: true }), 'Cancha no encontrada'),
  })
})

export const removeField = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ success: true, data: assertFound(await Field.findByIdAndDelete(id), 'Cancha no encontrada') })
})