const cartSchema = require('../model/cartModel');
const cartHelper = require('../helpers/cartHelper');
const productSchema = require('../model/productModel');
const { getProductsList, getProductDetails } = require('./productController');


const getCart = async (req, res) => {
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
            discountedTotal: totalPrice[0].total // Initialize with the total price
        };

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
};

// const addToCart = async (req, res) => {
//     try {
//         // Checking if user is logged in
//         if (req.session.user) {
//             // If logged in, extract user ID and product ID from request
//             const userId = req.session.user;
//             const productId = req.body.productId;

//             // Fetching stock quantity of the product
//             const Quantity = await productSchema.findOne({ _id: productId }, { quantity: 1 });
//             const stockQuantity = Quantity.quantity;

    
//             // Checking if a cart exists for the user
//             const cart = await cartSchema.findOne({ userId: userId });

//             if (stockQuantity > 0) {
//                 // If cart exists
//                 if (cart) {
//                     // Checking if the product already exists in the cart
//                     const exist = cart.items.find(item => item.productId == productId);

//                     if (exist) {
//                         // If the product already exists in the cart, increase the quantity
//                         const availableQuantity = stockQuantity - exist.quantity;
//                         if (availableQuantity > 0) {
//                             // If stock allows, increase the quantity in the cart
//                             await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
//                                 { $inc: { 'items.$.quantity': 1 } }
//                             );

//                             // Recalculate total price of the cart
//                             const totalPrice = await cartHelper.totalCartPrice(userId);

//                             // Calculate discounted price if applicable
//                             let discounted;
//                             if (cart.coupon && totalPrice && totalPrice.length > 0) {
//                                 discounted = await couponHelper.discountPrice(cart.coupon, totalPrice[0].total);
//                             }

//                             // Respond with success message and updated cart details
//                             res.status(200).json({
//                                 success: true,
//                                 message: 'Added to cart',
//                                 login: true,
//                                 totalPrice: totalPrice,
//                                 discounted: discounted
//                             });
//                         } else {
//                             // If the available quantity is zero, inform the user that the product is out of stock
//                             res.json({ message: "Oops! It seems you've reached the maximum quantity of products available for purchase.", login: true, outOfStock: true });
//                         }
//                     } else {
//                         // If the product doesn't exist in the cart, add it as a new item
//                         await cartSchema.updateOne({ userId: userId },
//                             { $push: { items: { productId: productId } } }
//                         );

//                         // Increase product count in session
//                         req.session.productCount++;

//                         // Respond with success message and indicate that it's a new item in the cart
//                         res.status(200).json({
//                             success: true,
//                             message: 'Added to cart',
//                             newItem: true,
//                             login: true
//                         });
//                     }
//                 } else {
//                     // If cart doesn't exist for the user, create a new cart and add the product to it
//                     const newCart = new cartSchema({
//                         userId: req.session.user,
//                         items: [{ productId: productId }]
//                     });
//                     await newCart.save();
//                     req.session.productCount++;

//                     // Respond with success message and indicate that it's a new item in the cart
//                     res.status(200).json({
//                         success: 'Added to cart',
//                         login: true,
//                         newItem: true
//                     });
//                 }
//             } else {
//                 // If the product is out of stock, inform the user
//                 res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
//             }
//         } else {
//             // If the user is not logged in, inform the user to log in
//             res.json({ login: false });
//         }
//     } catch (error) {
//         // Handle internal server errors
//         console.error(error);
//         res.redirect('/500');
//     }
// }

const addToCart = async (req, res) => {
    try {
        // Checking if user is logged in
        if (req.session.user) {
            // If logged in, extract user ID and product ID from request
            const userId = req.session.user;
            const productId = req.body.productId;

            // Fetching stock quantity of the product
            const product = await productSchema.findOne({ _id: productId });
            const stockQuantity = product.quantity;

            // Maximum quantity per person for the product
            const maxQtyPerPerson = 5;

            // Checking if a cart exists for the user
            const cart = await cartSchema.findOne({ userId: userId });

            // If stock is available
            if (stockQuantity > 0) {
                // Fetching existing quantity of the product in the user's cart
                const existingCartItem = cart ? cart.items.find(item => item.productId == productId) : null;
                const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;

                // Calculating the maximum quantity that can be added to the cart considering maximum quantity per person and available stock
                const maxQtyToAdd = Math.min(maxQtyPerPerson - currentQtyInCart, stockQuantity);

                // Checking if desired quantity to add is valid
                if (maxQtyToAdd > 0) {
                    // If cart exists
                    if (cart) {
                        // If the product already exists in the cart
                        if (existingCartItem) {
                            // If the product already exists in the cart
                            const availableQuantity = stockQuantity - existingCartItem.quantity;
                            // Check if adding one more will exceed the maximum quantity per person
                            if (existingCartItem.quantity < maxQtyPerPerson && availableQuantity > 0) {
                                // If stock allows and doesn't exceed max quantity per person, increase the quantity in the cart
                                await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
                                    { $inc: { 'items.$.quantity': 1 } }
                                );

                                // Recalculate total price of the cart
                                const totalPrice = await cartHelper.totalCartPrice(userId);

                                // Calculate discounted price 
                                let discounted;
                                if (cart.coupon && totalPrice && totalPrice.length > 0) {
                                    discounted = await couponHelper.discountPrice(cart.coupon, totalPrice[0].total);
                                }

                                // Calculate total discounted amount
                                // const totalDiscountedAmount = discounted.discountAmount;
                                //const totalDiscountedAmount = res.data.discounted ? res.data.discounted.discountAmount : 0;

                                let totalDiscountedAmount = 0;
                                if (response.data.discounted) {
                                     totalDiscountedAmount = res.data.discounted.discountAmount;
                                }


                                // Respond with success message and updated cart details
                                res.status(200).json({
                                    success: true,
                                    message: 'Added to cart',
                                    login: true,
                                    totalPrice: totalPrice,
                                    discounted: discounted,
                                    totalDiscountedAmount: totalDiscountedAmount
                                });
                            } else {
                                // If adding more exceeds the maximum quantity per person or available quantity is zero
                                res.json({ message: "Oops! It seems you've reached the maximum quantity allowed per person for this product.", login: true, outOfStock: true });
                            }
                        } else {
                            // If the product doesn't exist in the cart, add it as a new item
                            await cartSchema.updateOne({ userId: userId },
                                { $push: { items: { productId: productId, quantity: 1 } } }
                            );

                            // Increase product count in session
                            req.session.productCount++;

                            // Respond with success message and indicate that it's a new item in the cart
                            res.status(200).json({
                                success: true,
                                message: 'Added to cart',
                                newItem: true,
                                login: true
                            });
                        }
                    } else {
                        // If cart doesn't exist for the user, create a new cart and add the product to it
                        const newCart = new cartSchema({
                            userId: req.session.user,
                            items: [{ productId: productId, quantity: 1 }]
                        });
                        await newCart.save();
                        req.session.productCount++;

                        // Respond with success message and indicate that it's a new item in the cart
                        res.status(200).json({
                            success: 'Added to cart',
                            login: true,
                            newItem: true
                        });
                    }
                } else {
                    // If adding more exceeds the maximum quantity per person or available quantity is zero
                    res.json({ message: "Oops! It seems you've reached the maximum quantity allowed per person for this product.", login: true, outOfStock: true });
                }
            } else {
                // If the product is out of stock, inform the user
                res.json({ error: true, message: 'Out of stock', login: true, outOfStock: true });
            }
        } else {
            // If the user is not logged in, inform the user to log in
            res.json({ login: false });
        }
    } catch (error) {
        // Handle internal server errors
        console.error(error);
        res.redirect('/500');
    }
}


const decart = async (req, res) => {
    try {
        const { user } = req.session;
        const { productId } = req.body;

        const updatedCart = await cartSchema.findOneAndUpdate({
            userId: user,
            'items': {
                $elemMatch: {
                    productId: productId,
                    quantity: { $gte: 2 }
                }
            }
        },
        { $inc: { 'items.$.quantity': -1 } },
        { new: true });

        if (updatedCart) {
            // changing the cart price 
            const cart = await cartSchema.findOne({ userId: user });
            let totalPrice = 0;
            let discountedPrice = 0;

            // Calculate total price and discounted price
            for (const item of cart.items) {
                // Assuming getProductsList fetches product details based on productId
                const product = await getProductDetails(item.productId);
                totalPrice += product.price * item.quantity;
                discountedPrice += (product.price * (1 - (product.discount / 100))) * item.quantity;
            }

            res.status(200).json({ success: true, message: 'Cart item decreased', totalPrice: totalPrice, discountedPrice: discountedPrice });
        } else {
            res.json({ success: false, message: `Can't decrease the quantity` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const removeCartItem = async(req,res) =>{
    try{
        //destructuring the details of user and items with their item id
        const {user} = req.session
        const {itemId} = req.body
        await cartSchema.updateOne(
            {userId : user, ' items._id' : itemId},
            {$pull:{items : {_id:itemId}}}
            )

            if(req.session.productCount === 0){
                await cartSchema.deleteOne({userId : user})
            }
            const totalPrice = await cartHelper.totalCartPrice(user)
            const cart = await cartSchema.findOne({userId : user})
            
            if( cart && cart.coupon && totalPrice && totalPrice.length > 0 ) {
                discounted = await couponHelper.discountPrice( cart.coupon, totalPrice[0].total )
            }
            res.status(200).json({success:true,message:'Item removed',removeItem:true,totalPrice:totalPrice})

    }catch(error){
        console.log(error);
    }
}

module.exports = {
    getCart,
    addToCart,
    decart,
    removeCartItem
};
