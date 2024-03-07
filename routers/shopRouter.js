const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middleware/isAuth');

// router.get('/', shopController.getHome);
router.get('/shop',shopController.getShop);
router.get('/products/:id',shopController.getSingleProduct)



module.exports = router;
