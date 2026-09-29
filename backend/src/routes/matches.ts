import { Router } from 'express'
import {
  createMatchController,
  getMatch,
  listMatches,
  removeMatch,
  updateMatch,
  updateMatchScore,
} from '../controllers/match.controller.js'
import { validate } from '../middleware/validate.js'
import { adminRequired } from '../middleware/auth.js'
import {
  createMatchSchema,
  idParamsSchema,
  listMatchesQuerySchema,
  updateMatchSchema,
  updateMatchScoreSchema,
} from '../schemas/index.js'

const router = Router()

router.get('/', validate(listMatchesQuerySchema, 'query'), listMatches)
router.post('/', adminRequired, validate(createMatchSchema), createMatchController)
router.get('/:id', validate(idParamsSchema, 'params'), getMatch)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateMatchSchema), updateMatch)
router.patch('/:id/score', adminRequired, validate(idParamsSchema, 'params'), validate(updateMatchScoreSchema), updateMatchScore)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeMatch)

export default router