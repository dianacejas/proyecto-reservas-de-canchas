import { Router } from 'express'
import {
  approveRegistrationController,
  createRegistrationController,
  createTournament,
  generatePlayoffsController,
  getPlayoffBracketController,
  getTournament,
  getTournamentStandings,
  getTournamentStatsController,
  listRegistrationsController,
  listTournamentMatches,
  listTournaments,
  listTournamentTeams,
  rejectRegistrationController,
  removeTournament,
  updateTournament,
} from '../controllers/tournament.controller.js'
import { validate } from '../middleware/validate.js'
import { adminRequired } from '../middleware/auth.js'
import {
  approveRegistrationSchema,
  createRegistrationSchema,
  createTournamentSchema,
  generatePlayoffsSchema,
  idParamsSchema,
  listMatchesQuerySchema,
  listRegistrationsQuerySchema,
  listTeamsQuerySchema,
  listTournamentsQuerySchema,
  registrationParamsSchema,
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
router.get('/:id/stats', validate(idParamsSchema, 'params'), getTournamentStatsController)
router.get(
  '/:id/registrations',
  adminRequired,
  validate(idParamsSchema, 'params'),
  validate(listRegistrationsQuerySchema, 'query'),
  listRegistrationsController
)
router.post(
  '/:id/registrations',
  validate(idParamsSchema, 'params'),
  validate(createRegistrationSchema),
  createRegistrationController
)
router.post(
  '/:id/registrations/:registrationId/approve',
  adminRequired,
  validate(registrationParamsSchema, 'params'),
  validate(approveRegistrationSchema),
  approveRegistrationController
)
router.post(
  '/:id/registrations/:registrationId/reject',
  adminRequired,
  validate(registrationParamsSchema, 'params'),
  rejectRegistrationController
)
router.get('/:id', validate(idParamsSchema, 'params'), getTournament)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateTournamentSchema), updateTournament)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeTournament)

export default router