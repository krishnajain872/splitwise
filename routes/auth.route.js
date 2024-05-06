const { Router } = require('express')

const router = Router()
const authMiddleware = require('../middlewares/auth.middleware')
const authValidator = require('../validators/auth.validator.js')
const authController = require('../controllers/auth.controller.js')
const genericResponse = require('../helpers/commonResponse.helper')

router.post(
    '/login',
    authValidator.loginSchema,
    authController.userLogin,
    genericResponse.responseHelper
)
router.post(
    '/signup',
    authValidator.signupSchema,
    authController.userSignup,
    genericResponse.responseHelper
)
router.get(
    '/verify/:token',
    authMiddleware.checkAccessToken,
    authValidator.verifySchema,
    authController.verifyUser,
    genericResponse.responseHelper
)
router.get(
    '/send-verification',
    authMiddleware.checkAccessToken,
    authController.sendVerificationLink,
    genericResponse.responseHelper
)
router.post(
    '/access-token',
    authValidator.accessTokenSchema,
    authMiddleware.checkRefreshToken,
    authController.generateAccessToken,
    genericResponse.responseHelper
)
router.post(
    '/forget-password',
    authValidator.forgetSchema,
    authController.forgetPassword,
    genericResponse.responseHelper
)
router.post(
    '/reset-password',
    authValidator.resetSchema,
    authController.resetPassword,
    genericResponse.responseHelper
)
module.exports = router