const express = require('express')
const userController = require('../controllers/userController')
const orderController = require('../controllers/orderController')
const router = express.Router();

const isAuth = require('../middleware/isAuth')
const isBlocked = require('../middleware/isBlocked')

router.get('/profile',isAuth.userAuth,userController.getUserProfile)
router.put('/edit-profile',isAuth.userAuth,userController.editProfile)

router.get('/address',isAuth.userAuth,userController.userAddress)
router.get('/add-address',isAuth.userAuth,userController.getaddAddress)
router.post('/add-address',isAuth.userAuth,userController.addAddress)
router.get('/address',isAuth.userAuth,userController.getAddress)

router.get('/edit-address/:id', isAuth.userAuth, userController.getEditAddress)
router.post('/edit-address',isAuth.userAuth,userController.editAddress)

router.patch('/remove-address/:id',isAuth.userAuth,userController.    removeAddress)

router.get('/orders',isAuth.userAuth,isBlocked.isBlocked,orderController.getOrder)
router.get('/view-order-products/:id',isAuth.userAuth,isBlocked.isBlocked,orderController.userOrderProducts)
router.patch('/cancel-order',isAuth.userAuth,isBlocked.isBlocked,orderController.cancelOrder)
router.get('/getReturn/:id',isAuth.userAuth,isBlocked.isBlocked,orderController.getreturnOrder)


router.post( '/return-order', isAuth.userAuth,isBlocked.isBlocked, orderController.returnOrder )
module.exports = router;