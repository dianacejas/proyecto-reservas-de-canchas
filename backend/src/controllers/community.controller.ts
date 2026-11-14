import { CommunityNotice } from '../models/index.js'
import { createCommunityNoticeSchema, idParamsSchema } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listCommunityNotices = asyncHandler(async (_req, res) => {
  const notices = await CommunityNotice.find({ status: 'abierto' })
    .sort({ date: 1, createdAt: -1 })
    .lean()

  res.json({
    success: true,
    data: notices.map((n) => ({
      ...n,
      id: n._id.toString(),
    })),
  })
})

export const createCommunityNotice = asyncHandler(async (req, res) => {
  const parseResult = createCommunityNoticeSchema.safeParse(req.body)
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0]
    throw new AppError(400, issue?.message || 'Datos del aviso inválidos')
  }

  const notice = await CommunityNotice.create({
    ...parseResult.data,
    status: 'abierto',
  })

  res.status(201).json({
    success: true,
    data: {
      ...notice.toJSON(),
      id: notice._id.toString(),
    },
  })
})

export const closeCommunityNotice = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de aviso inválido')
  }

  const notice = assertFound(
    await CommunityNotice.findByIdAndUpdate(
      paramsParsed.data.id,
      { status: 'completado' },
      { new: true }
    ),
    'Aviso no encontrado'
  )

  res.json({
    success: true,
    data: {
      ...notice.toJSON(),
      id: notice._id.toString(),
    },
  })
})
