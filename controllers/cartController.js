const cartSchema = require('../model/cartModel');
const cartHelper = require('../helpers/cartHelper');
const productSchema = require('../model/productModel');

getCart : async (req,res)=>{
    try {
        // Extracting user session
        const { user } = req.session;

        // Variable to store the count of the products after updating quantity 
        let productCount;

        // Updating the quantities in the cart and documenting product count in session if necessary
        productCount = await cartHelper.updateQuantity(user);

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

        
        console.log(updatedCart);

        const totalPrice = await cartHelper.totalCartPrice(user)

        // checking if cart exists and has time 
        if(updatedCart && updatedCart.items > 0 ){
            // updating prices
            updatedCart.items.forEach(items => {
                return items
            });
        }

        res.render('shop/cart',{
            cartItems : updatedCart,
            totalAmount : totalPrice
        })

    } catch (error) {
        console.log(error);
        
    }
};
