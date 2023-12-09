const { Router } = require('express')

const groupController = require('../controllers/group.controller')
const groupPermission = require('../middlewares/permission.middleware')
const groupValidator = require('../validators/group.validator.js')
const genericResponse = require('./../helpers/commonResponse.helper')
const { checkAccessToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post(
    '/',
    checkAccessToken,
    groupValidator.createGroupSchema,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.createGroup,
    genericResponse.responseHelper
)
router.patch(
    '/',
    checkAccessToken,
    groupValidator.updateGroupSchema,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.createGroup,
    genericResponse.responseHelper
)
router.delete(
    '/:id/:user_id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermission,
    groupPermission.checkPermissionByTransactionDebt,
    groupController.deleteGroup,
    genericResponse.responseHelper
)

module.exports = router
