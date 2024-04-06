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


router.get('/forgot-password',authController.getforgotpassword)
router.post('/forgot-password',authController.forgotpassword)
router.post( '/password-otp-verification', isAuth.userLoggedout, authController.forgotPasswordOtpVerification  )

router.get('/adminsign',authController.adminsignUp)
router.post('/adminsign',authController.postadminlogin)


//get admin dashboard 
router.get('/adminDashBoard', isAuth.adminAuth,authController.adminDashBoard)


//user profile change password and the setting
router.get('/change-password',isAuth.userAuth,authController.getuserChangePassword)
router.post('/change-password',isAuth.userAuth,authController.changeUserPassword)
router.post('/new-password', isAuth.userLoggedout, authController.newPassword)


module.exports=router;