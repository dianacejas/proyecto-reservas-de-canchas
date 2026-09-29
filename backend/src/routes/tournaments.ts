import { Router } from 'express'
import {
  createTournament,
  generatePlayoffsController,
  getPlayoffBracketController,
  getTournament,
  getTournamentStandings,
  listTournamentMatches,
  listTournaments,
  listTournamentTeams,
  removeTournament,
  updateTournament,
} from '../controllers/tournament.controller.js'
import { validate } from '../middleware/validate.js'
import { adminRequired } from '../middleware/auth.js'
import {
  createTournamentSchema,
  generatePlayoffsSchema,
  idParamsSchema,
  listMatchesQuerySchema,
  listTeamsQuerySchema,
  listTournamentsQuerySchema,
  updateTournamentSchema,
} from '../schemas/index.js'

const router = Router()

router.get('/', validate(listTournamentsQuerySchema, 'query'), listTournaments)
router.post('/', adminRequired, validate(createTournamentSchema), createTournament)
router.get('/:id/teams', validate(idParamsSchema, 'params'), validate(listTeamsQuerySchema, 'query'), listTournamentTeams)
router.get('/:id/matches', validate(idParamsSchema, 'params'), validate(listMatchesQuerySchema, 'query'), listTournamentMatches)
router.get('/:id/standings', validate(idParamsSchema, 'params'), getTournamentStandings)
router.get('/:id/playoffs', validate(idParamsSchema, 'params'), getPlayoffBracketController)
router.post('/:id/playoffs', adminRequired, validate(idParamsSchema, 'params'), validate(generatePlayoffsSchema), generatePlayoffsController)
router.get('/:id', validate(idParamsSchema, 'params'), getTournament)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateTournamentSchema), updateTournament)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeTournament)

export default router