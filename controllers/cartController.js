const cartSchema = require('../model/cartModel');
const cartHelper = require('../helpers/cartHelper');
const productSchema = require('../model/productModel');

// const getCart = async (req,res)=>{
//     try {
//         // Extracting user session
//         const { user } = req.session;

//         // Variable to store the count of the products after updating quantity 
//         let productCount;

//         // Updating the quantities in the cart and documenting product count in session if necessary
//         productCount = await cartHelper.updateQuantity(user);

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

        
//         console.log(updatedCart);
//         console.log("hai");

//         const totalPrice = await cartHelper.totalCartPrice(user)

//         // checking if cart exists and has time 
//         if (updatedCart && updatedCart.items.length > 0) {
//             // updating prices
//             updatedCart.items.forEach(items => {
//                 return items;
//             });
//         }
        
//         res.render('shop/cart',{
//             cartItems : updatedCart,
//             totalAmount : totalPrice
//         })

//     } catch (error) {
//         console.log(error);
        
//     }
// };

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

const addToCart = async (req, res) => {
    try {
        // Checking if user is logged in
        if (req.session.user) {
            // If logged in, extract user ID and product ID from request
            const userId = req.session.user;
            const productId = req.body.productId;

            // Fetching stock quantity of the product
            const Quantity = await productSchema.findOne({ _id: productId }, { quantity: 1 });
            const stockQuantity = Quantity.quantity;

            // Checking if a cart exists for the user
            const cart = await cartSchema.findOne({ userId: userId });

            if (stockQuantity > 0) {
                // If cart exists
                if (cart) {
                    // Checking if the product already exists in the cart
                    const exist = cart.items.find(item => item.productId == productId);

                    if (exist) {
                        // If the product already exists in the cart, increase the quantity
                        const availableQuantity = stockQuantity - exist.quantity;
                        if (availableQuantity > 0) {
                            // If stock allows, increase the quantity in the cart
                            await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
                                { $inc: { 'items.$.quantity': 1 } }
                            );

                            // Recalculate total price of the cart
                            const totalPrice = await cartHelper.totalCartPrice(userId);

                            // Calculate discounted price if applicable
                            let discounted;
                            if (cart.coupon && totalPrice && totalPrice.length > 0) {
                                discounted = await couponHelper.discountPrice(cart.coupon, totalPrice[0].total);
                            }

                            // Respond with success message and updated cart details
                            res.status(200).json({
                                success: true,
                                message: 'Added to cart',
                                login: true,
                                totalPrice: totalPrice,
                                discounted: discounted
                            });
                        } else {
                            // If the available quantity is zero, inform the user that the product is out of stock
                            res.json({ message: "Oops! It seems you've reached the maximum quantity of products available for purchase.", login: true, outOfStock: true });
                        }
                    } else {
                        // If the product doesn't exist in the cart, add it as a new item
                        await cartSchema.updateOne({ userId: userId },
                            { $push: { items: { productId: productId } } }
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
                        items: [{ productId: productId }]
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

module.exports = {
    getCart,
    addToCart
};
