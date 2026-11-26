import { Router } from 'express'
import {
  closeCommunityNotice,
  createCommunityNotice,
  deleteCommunityNotice,
  listCommunityNotices,
} from '../controllers/community.controller.js'
import { adminRequired, authRequired } from '../middleware/auth.js'
import { communityCreateLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.get('/notices', listCommunityNotices)
router.post('/notices', communityCreateLimiter, authRequired, createCommunityNotice)
router.patch('/notices/:id/close', authRequired, closeCommunityNotice)
router.delete('/notices/:id', adminRequired, deleteCommunityNotice)

export default router
