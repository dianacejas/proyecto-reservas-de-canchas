import { CommunityNotice, User } from '../models/index.js'
import { createCommunityNoticeSchema, idParamsSchema } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const TTL_48_HOURS_MS = 48 * 60 * 60 * 1000

export const listCommunityNotices = asyncHandler(async (_req, res) => {
  const cutoffDate = new Date(Date.now() - TTL_48_HOURS_MS)
  await CommunityNotice.deleteMany({ createdAt: { $lt: cutoffDate } })

  const notices = await CommunityNotice.find({
    status: 'abierto',
    createdAt: { $gte: cutoffDate },
  })
    .sort({ createdAt: -1 })
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
  if (!req.user?.id) {
    throw new AppError(401, 'Debes iniciar sesión para publicar un aviso en la comunidad')
  }

  const parseResult = createCommunityNoticeSchema.safeParse(req.body)
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0]
    throw new AppError(400, issue?.message || 'Datos del aviso inválidos')
  }

  const author = await User.findById(req.user.id).select('name').lean()

  const notice = await CommunityNotice.create({
    ...parseResult.data,
    userId: req.user.id,
    authorName: author?.name || 'Jugador Copa 5',
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

export const deleteCommunityNotice = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de aviso inválido')
  }

  const deleted = assertFound(
    await CommunityNotice.findByIdAndDelete(paramsParsed.data.id),
    'Aviso no encontrado'
  )

  res.json({
    success: true,
    data: {
      ...deleted.toJSON(),
      id: deleted._id.toString(),
    },
  })
})
