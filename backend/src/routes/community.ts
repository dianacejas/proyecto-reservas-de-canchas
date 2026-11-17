import { Router } from 'express'
import {
  closeCommunityNotice,
  createCommunityNotice,
  deleteCommunityNotice,
  listCommunityNotices,
} from '../controllers/community.controller.js'
import { adminRequired, authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/notices', listCommunityNotices)
router.post('/notices', authRequired, createCommunityNotice)
router.patch('/notices/:id/close', authRequired, closeCommunityNotice)
router.delete('/notices/:id', adminRequired, deleteCommunityNotice)

export default router
