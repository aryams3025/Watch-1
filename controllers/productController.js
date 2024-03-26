const fs = require('fs');
const path = require('path');
const productSchema = require('../model/productModel');
const paginationHelper = require('../helpers/paginationHelper');
const categorySchema = require('../model/categoryModel');
const { error } = require('console');
const brandSchema = require('../model/brandModel');
const orderSchema = require('../model/orderModel');
const offerSchema = require('../model/offerModel')
module.exports = {
    getAddProducts: async (req, res) => {
        try {
            const categories = await categorySchema.find({ status: true });
            const brands = await brandSchema.find({ status: true });
            res.render('admin/add-products', {
                admin: req.session.admin,
                categories: categories,
                brands: brands,
            });
        } catch (error) {
            console.log(error);
        }
    },

    addProducts: async (req, res) => {
        try {
            for (let file of req.files) {
                if (
                    file.mimetype !== 'image/jpg' &&
                    file.mimetype !== 'image/jpeg' &&
                    file.mimetype !== 'image/png' &&
                    file.mimetype !== 'image/gif'
                ) {
                    req.flash('err', 'Check the image format');
                    return res.redirect('/admin/add-products');
                }
            }

            const img = [];
            for (let file of req.files) {
                img.push(file.filename);
            }

            // Parse price and discount values
            const price = parseFloat(req.body.price);
            const discount = req.body.discount ? parseFloat(req.body.discount) : 0;

            const product = new productSchema({
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brandId,
                image: img,
                category: req.body.categoryId,
                quantity: req.body.quantity,
                price: price,
                discount: discount
            });

            await product.save();
            res.redirect('/admin/products');
        } catch (error) {
            console.log(error);
        }
    },

    getProductDetails: async (req, res) => {
        try {
            const { search, sortData, sortOrder } = req.query || {};
            // let page = Number(req.query.page) || 1;
            // let page = Number(req.query && req.query.page) || 1;
            let page = Number(req.query && req.query.page) || 1;


            const sort = {};
            const condition = {};
            if (sortData) {
                sort[sortData] = sortOrder === 'Ascending' ? 1 : -1;
            }
            if (search) {
                condition.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            const availabileOffers = await offerSchema.find({ status : true, expiryDate : { $gte : new Date() }})
            const productsCount = await productSchema.find(condition).count();
            const productCount = await productSchema.find(condition).countDocuments();
            //const products = await productSchema.find(condition)
            const categories = await categorySchema.find();
            const products = await productSchema.find(condition)
                .populate('category')
                .populate('offer')
                .populate('brand')
                .sort(sort)
                .skip((page - 1) * paginationHelper.PRODUCT_PER_PAGE)
                .limit(paginationHelper.PRODUCT_PER_PAGE);
                
                res.render('admin/products', {
                admin: req.session.admin,
                // products: products,
                products: products || [],
                categories: categories,
                stockLeft : productsCount,
                currentPage: page,
                hasNextPage: page * paginationHelper.PRODUCT_PER_PAGE < productsCount,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(productsCount / paginationHelper.PRODUCT_PER_PAGE),
                search: search,
                sortData: sortData,
                sortOrder: sortOrder,
                availabileOffers  : availabileOffers
            });
        } catch (error) {
            console.log(error);
        }
    },

    //getProductDetails: async (req, res) => {
    //     try {
    //         const { search, sortData, sortOrder } = req.query || {};
    //         let page = Number(req.query && req.query.page) || 1;
    
    //         const sort = {};
    //         const condition = {};
    //         if (sortData) {
    //             sort[sortData] = sortOrder === 'Ascending' ? 1 : -1;
    //         }
    //         if (search) {
    //             condition.$or = [
    //                 { name: { $regex: search, $options: 'i' } },
    //                 { brand: { $regex: search, $options: 'i' } },
    //                 { description: { $regex: search, $options: 'i' } },
    //             ];
    //         }
    
    //         // Get total quantity of products
    //         const totalProducts = await productSchema.find(condition).countDocuments();
    
    //         // Get all orders
    //         const orders = await orderSchema.find();
    
    //         // Calculate total quantity ordered for each product
    //         const productQuantities = {};
    //         orders.forEach(order => {
    //             order.products.forEach(product => {
    //                 const productId = product.productId.toString();
    //                 const quantity = product.quantity;
    //                 if (!productQuantities[productId]) {
    //                     productQuantities[productId] = 0;
    //                 }
    //                 productQuantities[productId] += quantity;
    //             });
    //         });
    
    //         // Get products with calculated stock left
    //         const products = await productSchema.find(condition)
    //             .populate('category')
    //             .populate('offer')
    //             .populate('brand')
    //             .sort(sort)
    //             .skip((page - 1) * paginationHelper.PRODUCT_PER_PAGE)
    //             .limit(paginationHelper.PRODUCT_PER_PAGE);
    
    //         // Calculate and assign stock left for each product
    //         products.forEach(product => {
    //             const productId = product._id.toString();
    //             const orderedQuantity = productQuantities[productId] || 0;
    //             const stockLeft = product.quantity - orderedQuantity;
    //             product.stockLeft = stockLeft >= 0 ? stockLeft : 0;
    //         });
    
    //         const categories = await categorySchema.find();
            
    //         res.render('admin/products', {
    //             admin: req.session.admin,
    //             products: products || [],
    //             categories: categories,
    //             stockLeft: totalProducts, // Assign totalProducts as stockLeft
    //             currentPage: page,
    //             hasNextPage: page * paginationHelper.PRODUCT_PER_PAGE < totalProducts,
    //             hasPrevPage: page > 1,
    //             nextPage: page + 1,
    //             prevPage: page - 1,
    //             lastPage: Math.ceil(totalProducts / paginationHelper.PRODUCT_PER_PAGE),
    //             search: search,
    //             sortData: sortData,
    //             sortOrder: sortOrder,
    //         });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },
    

    editProduct: async (req, res) => {
        try {
            const product = await productSchema.findOne({ _id: req.params.id }).populate('category');
            const categories = await categorySchema.find();
            const brands = await brandSchema.find();
            res.render('admin/edit-products', {
                product: product,
                categories: categories,
                admin: req.session.admin,
                brands: brands,
            });
        } catch (error) {
            console.log(error);
        }
    },

    posteditProduct: async (req, res) => {
        try {
            const existingProduct = await productSchema.findById(req.body.productId);
            if (req.body.price < 0) {
                req.flash('err', 'Price should not be negative');
                return res.redirect(`/admin/edit-product/${existingProduct._id}`);
            }
            if (req.files) {
                for (let file of req.files) {
                    if (
                        file.mimetype !== 'image/jpg' &&
                        file.mimetype !== 'image/jpeg' &&
                        file.mimetype !== 'image/png' &&
                        file.mimetype !== 'image/gif'
                    ) {
                        req.flash('err', 'Check the format of Image');
                        return res.redirect(`/admin/edit-product/${existingProduct._id}`);
                    }
                }
                const images = existingProduct.image;
                req.files.forEach(element => {
                    images.push(element.filename);
                });
                var img = images;
            }
            await productSchema.updateOne(
                { _id: req.body.productId },
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        brand: req.body.brandId,
                        image: img,
                        category: req.body.categoryId,
                        quantity: req.body.quantity,
                        price: req.body.price,
                        discount: req.body.discount
                    }
                }
            );
            res.redirect('/admin/products');
        } catch (error) {
            console.log(error);
        }
    },

    listProduct: async (req, res) => {
        try {
            await productSchema.updateOne({ _id: req.params.id }, { $set: { status: true } });
            res.redirect('/admin/products');
        } catch (error) {
            console.log(error);
        }
    },

    unlistProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await productSchema.findById(productId);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            await productSchema.updateOne({ _id: productId }, { $set: { status: false } });
            res.redirect('/admin/products');
        } catch (error) {
            console.error(error);
        }
    },

    deleteImage: async (req, res) => {
        try {
            const id = req.query.id;
            const image = req.query.imageId;
            await productSchema.updateOne({ _id: id }, { $pull: { image: image } });
            fs.unlink(path.join(__dirname, '../public/pictures/') + image, err => {
                if (err) {
                    console.log(error);
                }
            });
            console.log('Image deleted successfully');
            res.redirect(`/edit-product/${id}`);
        } catch (error) {
            console.log(error);
        }
    },
};
