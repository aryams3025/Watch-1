const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middleware/isAuth');
const cartSchema = require('../controllers/cartController')
// router.get('/', shopController.getHome);
router.get('/shop',shopController.getShop);
router.get('/products/:id',shopController.getSingleProduct)

router.get('/cart',isAuth.userAuth,cartController.getCart)

module.exports = router;
