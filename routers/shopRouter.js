const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middleware/isAuth');
const cartController = require('../controllers/cartController')
// router.get('/', shopController.getHome);
router.get('/shop',shopController.getShop);
router.get('/products/:id',shopController.getSingleProduct)

router.get('/cart',isAuth.userAuth,cartController.getCart)
router.post('/add-to-cart',isAuth.userAuth,cartController.addToCart)

router.post('/decrease-cart',isAuth.userAuth,cartController.decart)
router.patch('/removeCartItem',isAuth.userAuth,cartController.removeCartItem)
module.exports = router;
