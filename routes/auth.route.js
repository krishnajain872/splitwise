const { Router } = require('express')

const router = Router()
const authMiddleware = require('../middlewares/auth.middleware')
const authValidator = require('../validators/auth.validator.js')
const authController = require('../controllers/auth.controller.js')
const genericResponse = require('../helpers/commonResponse.helper')
const userSerializer = require('../serializers/signup.serializers')

router.post(
    '/login',
    authValidator.loginSchema,
    authController.userLogin,
    userSerializer.userLogin,
    genericResponse.responseHelper
)
router.post(
    '/signup',
    authValidator.signupSchema,
    authController.userSignup,
    userSerializer.userSignupData,
    genericResponse.responseHelper
)
router.get(
    '/verify/:token',
    authMiddleware.checkAccessToken,
    authValidator.verifySchema,
    authController.verifyUser,
    userSerializer.userVerification,
    genericResponse.responseHelper
)
router.get(
    '/send-verification',
    authMiddleware.checkAccessToken,
    authController.sendVerificationLink,
    userSerializer.userSendVerification,
    genericResponse.responseHelper
)
router.post(
    '/access-token',
    authValidator.accessTokenSchema,
    authMiddleware.checkRefreshToken,
    authController.generateAccessToken,
    userSerializer.userGenerateAccessToken,
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
    userSerializer.userResetPassword,
    genericResponse.responseHelper
)
module.exports = router
