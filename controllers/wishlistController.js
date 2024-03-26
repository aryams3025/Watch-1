const wishlistSchema=require('../model/wishlistModel')

module.exports={
    //Add items to wiishlist
    addToWishlist:async(req,res)=>{
        try{
            const {productId}=req.body
            const {user}=req.session
            const wishlist=await wishlistSchema.findOne({userId:user})
            if(wishlist){
                //checks the product already exist
                const exist=await wishlist.products.find(item=>item==productId)
                if(exist){
                    res.json({message:"Product already exist"})
                }else{
                    await wishlistSchema.updateOne({userId:user},{
                        $push:{
                            products:productId
                        }
                    })
                    res.json({success:true,message:'Added to wishlist'})
                }
            }else{
                const newWishlist=new wishlistSchema({
                    userId:user,
                    products:[productId]
                } )
                await newWishlist.save()
                res.status(200).json({success:true,message:"Added to wishlist"})
            }
        }catch(error){
            res.redirect('/500')
        }
    },
    //Getting wishlist
    getWishlist:async(req,res)=>{
        try{
            const {user}=req.session
            const list = await wishlistSchema.find({ userId: user }).populate({
        path: 'products',
        populate: [
            { path: 'offer' },
            { path: 'category', populate: { path: 'offer' } }
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