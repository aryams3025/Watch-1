const express = require('express')
const userController = require('../controllers/userController')
const router = express.Router();

const isAuth = require('../middleware/isAuth')
const isBlocked = require('../middleware/isBlocked')

router.get('/profile',isAuth.userAuth,userController.getUserProfile)


router.get('/address',isAuth.userAuth,userController.userAddress)
router.get('/add-address',isAuth.userAuth,userController.getaddAddress)
router.post('/add-address',isAuth.userAuth,userController.addAddress)
router.get('/address',isAuth.userAuth,userController.getAddress)

router.get('/edit-address/:id', isAuth.userAuth, userController.getEditAddress)
router.post('/edit-address',isAuth.userAuth,userController.editAddress)

router.patch('/remove-address/:id',isAuth.userAuth,userController.    removeAddress)
module.exports = router;