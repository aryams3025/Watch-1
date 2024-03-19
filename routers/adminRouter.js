const express=require('express')
const router=express.Router()

const multer = require('multer')
const upload_image = require('../middleware/multer.js')

const adminController = require('../controllers/adminController.js')
const authController=require('../controllers/authController.js')
const productController = require('../controllers/productController.js')
const isAuth = require('../middleware/isAuth.js')
const categoryContoller = require('../controllers/categoryContoller.js')
const brandController = require('../controllers/brandController.js')
const couponController = require('../controllers/couponController.js')
const orderController = require('../controllers/orderController.js')



router.get( '/logout', isAuth.adminAuth,authController.doAdminLogout )
router.get('/user-list',isAuth.adminAuth,adminController.usersList)
router.patch('/block-user/:id',isAuth.adminAuth,adminController.blockUser)
router.patch('/unblock-user/:id',isAuth.adminAuth,adminController.unblockUser)



router.get('/products',isAuth.adminAuth,productController.getProductDetails)
router.get('/add-products',isAuth.adminAuth,productController.getAddProducts)
router.post('/add-products',isAuth.adminAuth,upload_image.array('image',4),productController.addProducts)
router.get('/edit-product/:id',isAuth.adminAuth,productController.editProduct),
router.post('/edit-product',isAuth.adminAuth,upload_image.array('image',4),productController.posteditProduct)




router.get('/category',isAuth.adminAuth,categoryContoller.getCategory)
router.post('/add-category',isAuth.adminAuth,categoryContoller.addCategory)
router.get('/edit-category/:id',isAuth.adminAuth,categoryContoller.geteditCategory)
router.post('/edit-category',isAuth.adminAuth,categoryContoller.editCategory)
router.get('/list-category/:id',isAuth.adminAuth,categoryContoller.listCategory)
router.get('/unlist-category/:id',isAuth.adminAuth,categoryContoller.unlistCategory)
router.get('/delete-category',isAuth.adminAuth,categoryContoller.deleteCategory)

router.get('/brand',isAuth.adminAuth,brandController.getaddBrand)
router.post('/add-brand',isAuth.adminAuth,brandController.addBrand)
router.get('/edit-brand/:id',isAuth.adminAuth,brandController.geteditBrand)
router.post('/edit-brand',isAuth.adminAuth,brandController.editBrand)
router.get('/list-brand/:id',isAuth.adminAuth,brandController.listBrand)
router.get('/unlist-brand/:id',isAuth.adminAuth,brandController.unlistBrand)



router.get('/list-product/:id',isAuth.adminAuth,productController.listProduct)
router.get('/unlist-product/:id',isAuth.adminAuth,productController.unlistProduct)


router.get('/delete-image',isAuth.adminAuth,productController.deleteImage)


router.get('/orders',isAuth.adminAuth,orderController.getAdminOrderList)
router.get('/order-products/:id',isAuth.adminAuth.orderController.orderDetails)





router.get('/coupons',isAuth.adminAuth,couponController.getCoupons)
router.get('/add-coupon',isAuth.adminAuth,couponController.getAddCoupon)
router.post('/add-coupon',isAuth.adminAuth,couponController.addCoupon)
router.get('/edit-coupon/:id',isAuth.adminAuth,couponController.getEditCoupon)
router.post('/edit-coupon',isAuth.adminAuth,couponController.editCoupon)
router.patch('/cancel-coupon',isAuth.adminAuth,couponController.cancelCoupon)
router.patch('/Reactive-coupon',isAuth.adminAuth,couponController.ReactiveCoupon)






module.exports = router