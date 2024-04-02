const express=require('express')
const router=express.Router()

const multer = require('multer')
const upload_image = require('../middleware/multer.js')

const adminController = require('../controllers/adminController.js')
const authController=require('../controllers/authController.js')
const productController = require('../controllers/productController.js')
const isAuth = require('../middleware/isAuth.js')
const categoryController = require('../controllers/categoryContoller.js')
const brandController = require('../controllers/brandController.js')
const couponController = require('../controllers/couponController.js')
const orderController = require('../controllers/orderController.js')
const offerController = require('../controllers/offerController.js')

//admin logout and user management

router.get( '/logout', isAuth.adminAuth,authController.doAdminLogout )
router.get('/user-list',isAuth.adminAuth,adminController.usersList)
router.patch('/block-user/:id',isAuth.adminAuth,adminController.blockUser)
router.patch('/unblock-user/:id',isAuth.adminAuth,adminController.unblockUser)

// admin product management

router.get('/products',isAuth.adminAuth,productController.getProductDetails)
router.get('/add-products',isAuth.adminAuth,productController.getAddProducts)
router.post('/add-products',isAuth.adminAuth,upload_image.array('image',4),productController.addProducts)
router.get('/edit-product/:id',isAuth.adminAuth,productController.editProduct),
router.post('/edit-product',isAuth.adminAuth,upload_image.array('image',4),productController.posteditProduct)
router.get('/list-product/:id',isAuth.adminAuth,productController.listProduct)
router.get('/unlist-product/:id',isAuth.adminAuth,productController.unlistProduct)
router.get('/delete-image',isAuth.adminAuth,productController.deleteImage)


//admin category management

router.get('/category',isAuth.adminAuth,categoryController.getCategory)
router.post('/add-category',isAuth.adminAuth,categoryController.addCategory)
router.get('/edit-category/:id',isAuth.adminAuth,categoryController.geteditCategory)
router.post('/edit-category',isAuth.adminAuth,categoryController.editCategory)
router.get('/list-category/:id',isAuth.adminAuth,categoryController.listCategory)
router.get('/unlist-category/:id',isAuth.adminAuth,categoryController.unlistCategory)
router.get('/delete-category',isAuth.adminAuth,categoryController.deleteCategory)

//admin brand management

router.get('/brand',isAuth.adminAuth,brandController.getaddBrand)
router.post('/add-brand',isAuth.adminAuth,brandController.addBrand)
router.get('/edit-brand/:id',isAuth.adminAuth,brandController.geteditBrand)
router.post('/edit-brand',isAuth.adminAuth,brandController.editBrand)
router.get('/list-brand/:id',isAuth.adminAuth,brandController.listBrand)
router.get('/unlist-brand/:id',isAuth.adminAuth,brandController.unlistBrand)

//order management

router.get('/orders',isAuth.adminAuth,orderController.getAdminOrderList)
router.get('/order-products/:id',isAuth.adminAuth,orderController.orderDetails)
router.patch('/change-order-status',isAuth.adminAuth,orderController.changeOrderStatus)

// coupon management

router.get('/coupons', isAuth.adminAuth, couponController.getCoupons);
router.get('/add-coupon', isAuth.adminAuth, couponController.getAddCoupon);
router.post('/add-coupon', isAuth.adminAuth, couponController.addCoupon);
router.get('/edit-coupon/:id', isAuth.adminAuth, couponController.getEditCoupon);
router.post('/edit-coupon', isAuth.adminAuth, couponController.editCoupon);
router.patch('/cancel-coupon', isAuth.adminAuth, couponController.cancelCoupon);
router.patch('/reactivate-coupon', isAuth.adminAuth, couponController.reactivateCoupon);


router.get('/coupons',isAuth.userAuth,couponController.getCoupons)

//offer management 

router.get('/offers',isAuth.adminAuth,offerController.getOffers)
router.get('/add-offer',isAuth.adminAuth,offerController.getAddOffer)
router.post('/add-offer',isAuth.adminAuth,offerController.addOffer)
router.get('/edit-offer/:id',isAuth.adminAuth,offerController.geteditOffer)
router.post('/edit-offer',isAuth.adminAuth,offerController.posteditOffer)
router.patch('/cancel-offer',isAuth.adminAuth,offerController.cancelOffer)
router.patch('/activate-offer',isAuth.adminAuth,offerController.activateOffer)
router.patch( '/apply-product-offer', isAuth.adminAuth, productController.applyProductOffer )
router.patch( '/remove-product-offer', isAuth.adminAuth, productController.removeProductOffer )
router.patch( '/apply-category-offer', isAuth.adminAuth, categoryController.applyCategoryOffer )
router.patch( '/remove-category-offer', isAuth.adminAuth, categoryController.removeCategoryOffer )

//get sales report 

router.get('/sales-report',isAuth.adminAuth,orderController.getSalesReport)

module.exports = router