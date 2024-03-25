const cartHelper = require('../helpers/cartHelper')
const cartSchema = require('../model/cartModel')
const productSchema = require('../model/productModel')



const {getProductDetails } = require('./productController');


module.exports = {
    // getCart : async (req,res) =>{
    //     try {
    //         // Extracting user session
    //         const { user } = req.session;
    
    
    //         // Updating the quantities in the cart and documenting product count in session if necessary
    //         const productCount = await cartHelper.updateQuantity(user);
    //         if (productCount) {
    //             req.session.productCount--;
    //         }
    
    
    //         // Then retrieving updated cart with populated product information
    //         const updatedCart = await cartSchema.findOne({ userId: user })
    //             .populate({
    //                 path: 'items.productId',
    //                 populate: {
    //                     path: 'category'
    //                 }
    //             });
    
    
    //         // Calculate total price of the cart
    //         const totalPrice = await cartHelper.totalCartPrice(user);
    
    
    //         // Define the variable to store discounted total
    //         let discounted = {
    //             discountAmount: 0,
    //             discountedTotal: totalPrice[0].total // Initialize with the total price
    //         };
    
    
    //         // Calculate discounted total if cart contains items
    //         if (updatedCart && updatedCart.items.length > 0) {
    //             discounted.discountAmount = updatedCart.items.reduce((totalDiscount, item) => {
    //                 // Calculate discounted price for each item
    //                 const discountedPrice = item.productId.price * (1 - item.productId.discount / 100);
    //                 // Calculate discount amount for this item
    //                 const discountAmountForItem = (item.productId.price - discountedPrice) * item.quantity;
    //                 return totalDiscount + discountAmountForItem;
    //             }, 0);
    //             discounted.discountedTotal -= discounted.discountAmount; // Subtract discount from total
    //         }
    
    
    //         res.render('shop/cart', {
    //             cartItems: updatedCart,
    //             totalAmount: totalPrice,
    //             discounted: discounted
    //         });
    
    
    //     } catch (error) {
    //         console.log(error);
    //         // Handle errors appropriately
    //     }
    
    // },
    // addToCart : async (req,res) =>{
    //     try {
    //         // Check if user is logged in
    //         if (req.session.user) {
    //             // If logged in
    //             const userId = req.session.user;
    //             const productId = req.body.productId;
    
    //             // Get stock quantity and product details
    //             const product = await productSchema.findOne({ _id: productId });
    //             const stockQuantity = product.quantity;
    //             const maxQtyPerPerson = 5; // Setting maximum quantity per person to 5
    
    //             if (stockQuantity > 0) {
    //                 // Check if cart exists
    //                 let cart = await cartSchema.findOne({ userId: userId });
    
    //                 if (!cart) {
    //                     // Create new cart for user
    //                     cart = new cartSchema({
    //                         userId: req.session.user,
    //                         items: []
    //                     });
    //                     await cart.save();
    //                 }
    
    //                 // Check if product already exists in cart
    //                 const existingItem = cart.items.find(item => item.productId == productId);
    
    //                 if (existingItem) {
    //                     // Calculate available quantity to add
    //                     const availableQuantity = Math.min(stockQuantity - existingItem.quantity, maxQtyPerPerson - existingItem.quantity);
    //                     if (availableQuantity > 0) {
    //                         // Increase quantity
    //                         await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
    //                             { $inc: { 'items.$.quantity': 1 } }
    //                         );
    //                         req.session.productCount++; // Increase product count in session
    //                         return res.status(200).json({ success: true, message: 'Added to cart', login: true });
    //                     } else {
    //                         // If available quantity is 0, indicate that it's out of stock
    //                         return res.json({ message: "Oops! It seems you've reached the maximum quantity of products available for purchase.", login: true, outOfStock: true });
    //                     }
    //                 } else {
    //                     // Check if available quantity is greater than 0
    //                     const availableQuantity = Math.min(stockQuantity, maxQtyPerPerson);
    //                     if (availableQuantity > 0) {
    //                         // Add new item to cart
    //                         await cartSchema.updateOne({ userId: userId },
    //                             { $push: { items: { productId: productId, quantity: 1 } } }
    //                         );
    //                         req.session.productCount++; // Increase product count in session
    //                         return res.json({ success: true, message: 'Added to cart', login: true });
    //                     } else {
    //                         // If product is out of stock
    //                         return res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
    //                     }
    //                 }
    //             } else {
    //                 // If product is out of stock
    //                 res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
    //             }
    //         } else {
    //             // If user is not logged in
    //             res.json({ login: false });
    //         }
    //     } catch (error) {
    //         res.redirect('/500');
    //     }
    // },

    getCart : async (req, res) => {
        try {
            // Extracting user session
            const { user } = req.session;
    
            // Updating the quantities in the cart and documenting product count in session if necessary
            const productCount = await cartHelper.updateQuantity(user);
            if (productCount) {
                req.session.productCount--;
            }
    
            // Then retrieving updated cart with populated product information
            const updatedCart = await cartSchema.findOne({ userId: user })
                .populate({
                    path: 'items.productId',
                    populate: {
                        path: 'category'
                    }
                });
    
            // Calculate total price of the cart
            const totalPrice = await cartHelper.totalCartPrice(user);
    
            // Define the variable to store discounted total
            let discounted = {
                discountAmount: 0,
                discountedTotal: 0 // Initialize with a default value
            };
    
            // Check if totalPrice is defined and not empty
            if (totalPrice && totalPrice.length > 0 && totalPrice[0].total !== undefined) {
                // Assign total only if it exists
                discounted.discountedTotal = totalPrice[0].total;
            }
    
            // Calculate discounted total if cart contains items
            if (updatedCart && updatedCart.items.length > 0) {
                discounted.discountAmount = updatedCart.items.reduce((totalDiscount, item) => {
                    // Calculate discounted price for each item
                    const discountedPrice = item.productId.price * (1 - item.productId.discount / 100);
                    // Calculate discount amount for this item
                    const discountAmountForItem = (item.productId.price - discountedPrice) * item.quantity;
                    return totalDiscount + discountAmountForItem;
                }, 0);
                discounted.discountedTotal -= discounted.discountAmount; // Subtract discount from total
            }
    
            res.render('shop/cart', {
                cartItems: updatedCart,
                totalAmount: totalPrice,
                discounted: discounted
            });
    
        } catch (error) {
            console.log(error);
            // Handle errors appropriately
        }
    },

    addToCart: async (req, res) => {
        try {
            // Check if user is logged in
            if (req.session.user) {
                // If logged in
                const userId = req.session.user;
                const productId = req.body.productId;
    
                // Get stock quantity and product details
                const product = await productSchema.findOne({ _id: productId });
                const stockQuantity = product.quantity;
                const maxQtyPerPerson = 5; // Setting maximum quantity per person to 5
    
                if (stockQuantity > 0) {
                    // Check if cart exists
                    let cart = await cartSchema.findOne({ userId: userId });
    
                    if (!cart) {
                        // Create new cart for user
                        cart = new cartSchema({
                            userId: req.session.user,
                            items: []
                        });
                        await cart.save();
                    }
    
                    // Check if product already exists in cart
                    const existingItem = cart.items.find(item => item.productId == productId);
    
                    if (existingItem) {
                        // Calculate available quantity to add
                        const availableQuantity = Math.min(stockQuantity - existingItem.quantity, maxQtyPerPerson - existingItem.quantity);
                        if (availableQuantity > 0) {
                            // Increase quantity
                            await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
                                { $inc: { 'items.$.quantity': 1 } }
                            );
                            req.session.productCount++; // Increase product count in session
                            
                            // Display a SweetAlert for successfully adding item to cart
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'The selected product has been added to your cart.',
                            });
                            
                            return res.status(200).json({ success: true, message: 'Added to cart', login: true });
                        } else {
                            // available quantity is 0 indicate that it's out of stock
                            return res.json({ message: "Oops! It seems you've reached the maximum quantity of products available for purchase.", login: true, outOfStock: true });
                        }
                    } else {
                        // Check if available quantity is greater than 0
                        const availableQuantity = Math.min(stockQuantity, maxQtyPerPerson);
                        if (availableQuantity > 0) {
                            // Add new item to cart
                            await cartSchema.updateOne({ userId: userId },
                                { $push: { items: { productId: productId, quantity: 1 } } }
                            );
                            req.session.productCount++; // Increase product count in session
                            
                            // Display a SweetAlert for successfully adding item to cart
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'The selected product has been added to your cart.',
                            });
                            
                            return res.json({ success: true, message: 'Added to cart', login: true });
                        } else {
                            // If product is out of stock
                            return res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
                        }
                    }
                } else {
                    // If product is out of stock
                    res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
                }
            } else {
                // If user is not logged in
                res.json({ login: false });
            }
        } catch (error) {
            res.redirect('/500');
        }
    },
    

    deCart : async(req,res) =>{
        try {
            const { user } = req.session;
            const { productId } = req.body;
    
            // Find the cart and the product details
            const cart = await cartSchema.findOne({ userId: user });
            const product = await productSchema.findById(productId);
    
            // Find the product in the cart items
            const cartItem = cart.items.find(item => item.productId.toString() === productId);
    
            if (!cartItem) {
                return res.json({ success: false, message: 'Product not found in the cart' });
            }
    
            // Ensure that quantity is greater than 1
            if (cartItem.quantity > 1) {
                // Decrease the quantity by 1
                cartItem.quantity -= 1;
    
                // Update the cart
                await cart.save();
    
                // Recalculate total price considering the discount
                const totalPrice = await cartHelper.totalCartPrice(user);
                let discounted;
                if (totalPrice && totalPrice.length > 0) {
                    discounted = totalPrice[0].total - (product.discount * cartItem.quantity);
                }
    
               return res.json({ success: true, message: 'Cart item decreased', totalPrice: discounted });
            } else {
                return res.json({ success: false, message: `Can't decrease the quantity` });
            }
        } catch (error) {
            res.redirect('/500');
        }
    },
  removeCartItem : async(req, res)=> {
        try {
            const { user } = req.session;
            const { itemId } = req.body;
    
            // Remove the item from the cart
            await cartSchema.updateOne({ userId: user, 'items._id': itemId }, { $pull: { items: { _id: itemId } } });
    
            // Decrease product count in session if necessary
            if (req.session.productCount > 0) {
                req.session.productCount--;
            }
    
            // If there are no items left in the cart, delete the cart
            if (req.session.productCount === 0) {
                await cartSchema.deleteOne({ userId: user });
            }
    
            // Recalculate total price considering the discount
            const totalPrice = await cartHelper.totalCartPrice(user);
            let discounted;
            if (totalPrice && totalPrice.length > 0) {
                discounted = totalPrice[0].total;
            }
    
            res.status(200).json({ success: true, message: 'Item removed', removeItem: true, totalPrice: discounted });
        } catch (error) {
            res.redirect('/500');
        }
    }
    
}