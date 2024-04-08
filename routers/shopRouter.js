const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middleware/isAuth');
const isBlocked = require('../middleware/isBlocked')
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const couponController = require('../controllers/couponController')
const orderController = require('../controllers/orderController')

//shop

// router.get('/', shopController.getHome);
router.get('/shop',shopController.getShop);
router.get('/products/:id',shopController.getSingleProduct)
router.get('/contactus',isAuth.userAuth,shopController.contactus)
router.post('/contactsubmit',isAuth.userAuth,shopController.contactsubmit)

//cart

router.get('/cart',isAuth.userAuth,cartController.getCart)
router.post('/add-to-cart',isAuth.userAuth,cartController.addToCart)
router.post('/decrease-cart',isAuth.userAuth,cartController.deCart)
router.patch('/removeCartItem',isAuth.userAuth,cartController.removeCartItem)

//check-out

router.get('/checkout',isAuth.userAuth,isBlocked.isBlocked,shopController.getCheckOut)
router.get('/add-checkout-address',isAuth.userAuth,isBlocked.isBlocked,shopController.getCheckoutAddAddress)
router.post('/add-checkout-address',isAuth.userAuth,isBlocked.isBlocked,shopController.checkoutAddAddress)

//order

router.post('/place-order',isAuth.userAuth,isBlocked.isBlocked,orderController.placeOrder)
router.get('/confirm-order',isAuth.userAuth,isBlocked.isBlocked,orderController.getConfirmOrder)

//wishlist

router.post('/add-to-wishlist',isAuth.userAuth,wishlistController.addToWishlist)
router.get ( '/wishlist', isAuth.userAuth, wishlistController.getWishlist )
router.put( '/remove-wishlist-item', isAuth.userAuth, wishlistController.removeItem )

//coupon

router.post('/apply-coupon',isAuth.userAuth,couponController.applyCoupn)
router.get('/cancelCoupon',isAuth.userAuth,couponController.cancelCouponuser)
//router.get('/availabile-coupons',isAuth.userAuth,couponController.getAvailabileCoupons)
router.get('/order-success',isAuth.userAuth,isBlocked.isBlocked,orderController.orderSuccess)
router.get('/invoice/:id',isAuth.userAuth,isBlocked.isBlocked,orderController.invoice)

module.exports = router;