const wishlistSchema=require('../model/wishlistModel')
const Product = require('../model/productModel')

module.exports={
    //Add items to wiishlist
    // addToWishList:async(req,res)=>{
    //     try{
    //         const {productId}=req.body
    //         const {user}=req.session
    //         const wishlist=await wishlistSchema.findOne({userId:user})
    //         if(wishlist){
    //             const exist=await wishlist.products.find(item=>item==productId)
    //             if(exist){
    //                 res.json({message:"Product already exist"})
    //             }else{
    //                 await wishlistSchema.updateOne({userId:user},{
    //                     $push:{
    //                         products:productId
    //                     }
    //                 })
    //                 console.log("hai")
    //                 res.render('user/wishlist', {list : wishlist})
    //                 //res.json({success:true,message:'Added to wishlist'})
    //             }
    //         }else{
    //             const newWishlist=new wishlistSchema({
    //                 userId:user,
    //                 products:[productId]
    //             } )
    //             await newWishlist.save()
    //             res.status(200).json({success:true,message:"Added to wishlist"})
    //         }
    //     }catch(error){
    //         res.redirect('/500')
    //     }
    // },


    addToWishList: async (req, res) => {
        try {
            const { productId } = req.body;
            const { user } = req.session;

            // Find the wishlist for the user
            let wishlist = await wishlistSchema.findOne({ userId: user }).populate('products');

            if (wishlist) {
                // Check if the product already exists in the wishlist
                const exist = wishlist.products.find(item => item._id.toString() === productId);
                if (exist) {
                    return res.json({ message: "Product already exists in the wishlist" });
                } else {
                    // Fetch the complete product details
                    const product = await Product.findById(productId);
                    if (!product) {
                        return res.status(404).json({ message: "Product not found" });
                    }
                    // Add the complete product object to the wishlist
                    wishlist.products.push(product);
                    await wishlist.save();
                }
            } else {
                // Create a new wishlist if one doesn't exist for the user
                const newWishlist = new wishlistSchema({
                    userId: user,
                    products: [productId]
                });
                await newWishlist.save();
            }

            // Redirect to the wishlist page after adding the product
            res.redirect('/wishlist');

        } catch (error) {
            console.log(error);
            res.redirect('/500');
        }
    },


    //Getting wishlist
    getWishList:async(req,res)=>{
        try{
            const {user}=req.session
            const list = await wishlistSchema.find({ userId: user }).populate({
        path: 'products',
        populate: [
            //{ path: 'offer' },
            { path: 'category' }
        ]
    });
            res.render('user/wishlist',{
                list:list
            })
        }catch(error){
            res.redirect('/500')

        }
    },
    //Remove item from wishlist
    removeItem:async(req,res)=>{
        try{
            const {productId}=req.body
            const {user}=req.session
            await wishlistSchema.findOneAndUpdate({userId:user},{
                $pull:{
                    products:productId
                }
            })
            wishlist=await wishlistSchema.findOne({userId:user})
            if(wishlist.products.length===0){
                await wishlistSchema.deleteOne({userId:user})
                return res.json({success:true})
            }
            
        }catch(error){
            res.redirect('/500')
        }
    }
    
}