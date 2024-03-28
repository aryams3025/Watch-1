const cartHelper = require('../helpers/cartHelper');
const cartSchema=require('../model/cartModel')
const productSchema=require('../model/productModel')
const couponSchema=require('../model/couponModel')
const couponHelper=require('../helpers/couponHelper')
const {getProductDetails } = require('./productController');
module.exports={
    //cart
    getCart : async( req, res ) => {
        try {
            const { user } = req.session;   
             let discounted
            const productCount = await cartHelper.updateQuantity( user )
           if(productCount){
            req.session.productCount--
           }
            const updatedCart = await cartSchema.findOne({ userId : user }).populate({
                path : 'items.productId',
                populate : [{
                    path : 'category',
                    populate : {
                        path : 'offer'
                    },
                },
                    {
                    path : 'offer'
                    }
                ]
            });
            
            const totalPrice = await cartHelper.totalCartPrice( user )

            if( updatedCart && updatedCart.items > 0 ){
                
                req.session.productCount = updatedCart.items.length
                updatedCart.items.forEach(( items ) => {
                
                    if( items.productId.offer && items.productId.offer.startingDate <= new Date() && items.productId.offer.expiryDate >= new Date() ) {
                        items.productId.price = (items.productId.price * ( 1 - ( items.productId.offer.percentage / 100 ))).toFixed(0)
                    }else if ( items.productId.category.offer && items.productId.category.offer.startingDate <= new Date() && items.productId.category.offer.expiryDate >= new Date() ) {
                        items.productId.price = (items.productId.price * ( 1 - ( items.productId.category.offer.percentage / 100 ))).toFixed(0)
                    }
                    
                    return items
                })
            } 
            
            if( updatedCart && updatedCart.coupon && totalPrice && totalPrice.length > 0 ) {
                discounted = await couponHelper.discountPrice( updatedCart.coupon, totalPrice[0].total )
            }
            
            const availableCoupons = await couponSchema.find({ status : true , startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() } })
            console.log(updatedCart)
            

            res.render( 'shop/cart', {
                cartItems : updatedCart,
                totalAmount : totalPrice,
                availableCoupons : availableCoupons,
                discounted : discounted

            });
        } catch ( error ) {
            res.redirect('/500')

        }
    },
    

    addToCart : async(req,res)=>{
        try {
            // Checking if user is logged in
            if (req.session.user) {
                // If logged in
                userId = req.session.user;
                productId = req.body.productId;
    
                // Getting stock quantity
                const Quantity = await productSchema.findOne({ _id: productId }, { quantity: 1 });
                // Checking if cart exists
                const cart = await cartSchema.findOne({ userId: userId });
                const stockQuantity = Quantity.quantity;
                const maxQuantityPerPerson = 5;
    
                if (stockQuantity > 0) {
                    // If cart exists
                    if (cart) {
                        // If product exists in cart
                        const exist = cart.items.find(item => item.productId == productId);
                        if (exist) {
                            // Checking stock quantity with cart quantity
                            const availableQuantity = Math.min(stockQuantity, maxQuantityPerPerson) - exist.quantity;
                            if (availableQuantity > 0) {
                                // Quantity increases
                                const incrementQuantity = Math.min(availableQuantity, 1);
                                await cartSchema.updateOne({ userId: userId, 'items.productId': productId },
                                    { $inc: { 'items.$.quantity': incrementQuantity } }
                                );
                                // Total price of cart
                                const totalPrice = await cartHelper.totalCartPrice(userId);
    
                                let discounted;
                                if (cart.coupon && totalPrice && totalPrice.length > 0) {
                                    discounted = await couponHelper.discountPrice(cart.coupon, totalPrice[0].total);
                                }
    
                                res.status(200).json({
                                    success: true,
                                    message: 'Added to cart',
                                    login: true,
                                    totalPrice: totalPrice,
                                    discounted: discounted
                                });
                            } else {
                                // If cart quantity and available quantity are same
                                res.json({
                                    message: "Oops! It seems you've reached the maximum quantity of products available for purchase.",
                                    login: true,
                                    outOfStock: true
                                });
                            }
                        } else {
                            // If product not exists in cart, adding new object to items array
                            await cartSchema.updateOne({ userId: userId },
                                { $push: { items: { productId: productId } } }
                            );
                            // Increasing product count in session
                            req.session.productCount++;
                            res.status(200).json({
                                success: true,
                                message: 'Added to cart',
                                newItem: true,
                                login: true
                            });
                        }
                    } else {
                        // If cart does not exist, create new cart for user
                        const newCart = new cartSchema({
                            userId: req.session.user,
                            items: [{ productId: productId }]
                        });
                        await newCart.save();
                        req.session.productCount++;
                        res.status(200).json({
                            success: 'Added to cart',
                            login: true,
                            newItem: true
                        });
                    }
                } else {
                    // If product stock is empty
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
    //decreasing the quantity of products in cart
    deCart:async(req,res)=>{
            try{
                const {user}=req.session
                const {productId}=req.body
                //matching
                const updatedCart=await cartSchema.findOneAndUpdate({
                    userId:user,
                    'items':{$elemMatch:{productId:productId,quantity:{$gte:2}}}
                },
                {$inc:{'items.$.quantity':-1}},
                {new:true}
                );
                if( updatedCart) {
                    //Changing the cart price
                    const totalPrice = await cartHelper.totalCartPrice( user )
                    const cart = await cartSchema.findOne({ userId : user})
                    let discounted
                    if( cart.coupon && totalPrice && totalPrice.length > 0 ) {
                        discounted = await couponHelper.discountPrice( cart.coupon, totalPrice[0].total )   
                    }
                    res.status( 200 ).json({ success : true, message : 'cart item decreased', totalPrice : totalPrice, discounted : discounted });
                }else{
                    res.json({success:false,message:`can't decrease the quantity`})
                }
        }catch(error){
                res.redirect('/500')
        }
    },
    //removing items from cart
    removeCartItem:async(req,res)=>{
        try{
            
            const {user}=req.session
            const {itemId}=req.body
            await cartSchema.updateOne({userId:user,'items._id':itemId},
            {$pull:{items:{_id:itemId}}})
            if(req.session.productCount>0){
            req.session.productCount--
            }
            //if no elements in cart delete the cart
            if(req.session.productCount===0){
                await cartSchema.deleteOne({userId:user})
            }
            const totalPrice = await cartHelper.totalCartPrice(user)
            const cart = await cartSchema.findOne({ userId : user})
            let discounted
            if( cart && cart.coupon && totalPrice && totalPrice.length > 0 ) {
                discounted = await couponHelper.discountPrice( cart.coupon, totalPrice[0].total )
            }
            res.status(200).json({success:true,message:'Item removed',removeItem:true,totalPrice:totalPrice})
        }catch(error){
            res.redirect('/500')
        }
    }    

}