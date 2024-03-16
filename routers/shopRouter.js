const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middleware/isAuth');
const isBlocked = require('../middleware/isBlocked')
const cartController = require('../controllers/cartController')


const orderController = require('../controllers/orderController')
// router.get('/', shopController.getHome);
router.get('/shop',shopController.getShop);
router.get('/products/:id',shopController.getSingleProduct)

router.get('/cart',isAuth.userAuth,cartController.getCart)
router.post('/add-to-cart',isAuth.userAuth,cartController.addToCart)

router.post('/decrease-cart',isAuth.userAuth,cartController.deCart)
router.patch('/removeCartItem',isAuth.userAuth,cartController.removeCartItem)



router.get('/checkout',isAuth.userAuth,isBlocked.isBlocked,shopController.getCheckOut)
router.get('/add-checkout-address',isAuth.userAuth,isBlocked.isBlocked,shopController.getCheckoutAddAddress)
router.post('/add-checkout-address',isAuth.userAuth,isBlocked.isBlocked,shopController.checkoutAddAddress)


router.post('/place-order',isAuth.userAuth,isBlocked.isBlocked,orderController.placeOrder)



module.exports = router;