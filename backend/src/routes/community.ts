import { Router } from 'express'
import {
  closeCommunityNotice,
  createCommunityNotice,
  listCommunityNotices,
} from '../controllers/community.controller.js'

const router = Router()

router.get('/notices', listCommunityNotices)
router.post('/notices', createCommunityNotice)
router.patch('/notices/:id/close', closeCommunityNotice)

export default router
