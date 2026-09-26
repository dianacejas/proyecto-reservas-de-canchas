import { Router } from 'express'
import {
  createTeam,
  getTeam,
  listTeams,
  removeTeam,
  updateTeam,
} from '../controllers/team.controller.js'
import { validate } from '../middleware/validate.js'
import { adminRequired } from '../middleware/auth.js'
import { createTeamSchema, idParamsSchema, listTeamsQuerySchema, updateTeamSchema } from '../schemas/index.js'

const router = Router()

router.get('/', validate(listTeamsQuerySchema, 'query'), listTeams)
router.post('/', adminRequired, validate(createTeamSchema), createTeam)
router.get('/:id', validate(idParamsSchema, 'params'), getTeam)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateTeamSchema), updateTeam)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeTeam)

export default router