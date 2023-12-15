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
router.post(
    '/add-member',
    checkAccessToken,
    groupValidator.addMemberSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.addMember,
    genericResponse.responseHelper
)
// router.delete(
//     '/:id/remove/:user_id',
//     checkAccessToken,
//     groupValidator.paramsIdCheck,
//     groupPermission.checkPermissionByValidGroupMember,
//     groupController.removeMember,
//     genericResponse.responseHelper
// )
router.patch(
    '/',
    checkAccessToken,
    groupValidator.updateGroupSchema,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.updateGroup,
    genericResponse.responseHelper
)
router.get(
    '/',
    checkAccessToken,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.findAllGroupForCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/:id/members',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.findAllMemberForCurrentUser,
    genericResponse.responseHelper
)
router.delete(
    '/:id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermission,
    groupPermission.checkPermissionByTransactionDebt,
    groupController.deleteGroup,
    genericResponse.responseHelper
)
router.put(
    '/:id/expense/',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.updateExpense,
    genericResponse.responseHelper
)
router.post(
    '/:id/expense/',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.addExpense,
    genericResponse.responseHelper
)

module.exports = router
