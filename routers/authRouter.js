const express=require('express')
const router=express.Router()


const authController=require('../controllers/authController.js')
const isAuth=require('../middleware/isAuth')

router.get('/',authController.getUserLogin)
router.get('/landing',authController.getHome)


router.get('/login',authController.getUserLogin)
router.get('/login',authController.userLogin)
router.post('/home',authController.userLogin)
router.get('/usersignup',authController.usersignUp)

router.get('/logout',isAuth.userAuth,authController.doUserLogout)

router.post('/signup',authController.postuserSignup)
router.get('/otp-verification',authController.getotpVerification)
router.post('/otp-verification',authController.signupVerification)
router.get('/resend-otp',authController.resendOtp)
router.get('/forgotresendotp',authController.forgotresendOtp)


router.get('/forgot-password',authController.forgotpassword)
router.post('/postforgot-password',authController.postforgotpassword)
router.get('/adminsign',authController.adminsignUp)
router.post('/adminsign',authController.postadminlogin)

module.exports=router;