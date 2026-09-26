import { Router } from 'express'
import {
  createField,
  getField,
  listFields,
  removeField,
  updateField,
} from '../controllers/field.controller.js'
import { adminRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createFieldSchema,
  idParamsSchema,
  listFieldsQuerySchema,
  updateFieldSchema,
} from '../schemas/index.js'

const router = Router()

router.get('/', validate(listFieldsQuerySchema, 'query'), listFields)
router.post('/', adminRequired, validate(createFieldSchema), createField)
router.get('/:id', validate(idParamsSchema, 'params'), getField)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateFieldSchema), updateField)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeField)

export default router