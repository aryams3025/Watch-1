const couponSchema=require('../model/couponModel')
const cartSchema=require('../model/cartModel')
const couponHelper=require('../helpers/couponHelper')


module.exports={
    getCoupons: async (req, res) => {
        try {
            const { search, sortData, sortOrder } = req.query;
            const condition = {};
            if (search) {
                condition.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { descountType: { $regex: search, $options: "i" } }
                ];
            }
            const sort = {};
            if (sortData) {
                if (sortOrder === 'Ascending') {
                    sort[sortData] = 1;
                } else {
                    sort[sortData] = -1;
                }
            }
            const coupons = await couponSchema.find(condition).sort(sort);
            res.render('admin/coupons', {
                admin: true,
                coupons: coupons,
                search: search,
                sortData: sortData,
                sortOrder: sortOrder
            });
        } catch (error) {
            res.redirect('/500');
        }
    },
    getAddCoupon: (req, res) => {
        res.render('admin/add-coupon', {
            admin: true,
            err: req.flash('err')
        });
    },
    addCoupon: async (req, res) => {
        try {
            const { name, description, startingDate, expiryDate, minimumAmount, discountType, discount } = req.body;
            const exist = await couponSchema.findOne({ name: name.toUpperCase() });
            if (exist) {
                req.flash('err', 'Coupon name already Exists');
                return res.redirect('/admin/add-coupon');
            }
            const coupon = new couponSchema({
                name: name.toUpperCase(),
                description: description,
                startingDate: startingDate,
                expiryDate: expiryDate,
                minimumAmount: minimumAmount,
                discountType: discountType,
                discount: discount,
            });
            await coupon.save();
            res.redirect('/admin/coupons');
        } catch (error) {
            res.redirect('/500');
        }
    },
    getEditCoupon: async (req, res) => {
        try {
            const { id } = req.params;
            const coupon = await couponSchema.findOne({ _id: id });
            res.render('admin/edit-coupon', {
                admin: true,
                coupon: coupon
            });
        } catch (error) {
            res.redirect('/500');
        }
    },
    editCoupon: async (req, res) => {
        try {
            const { name, description, startingDate, expiryDate, minimumAmount, discountType, discount, id } = req.body;
            await couponSchema.updateOne({ _id: id }, {
                $set: {
                    name: name.toUpperCase(),
                    description: description,
                    startingDate: startingDate,
                    expiryDate: expiryDate,
                    minimumAmount: minimumAmount,
                    discountType: discountType,
                    discount: discount
                }
            });
            res.redirect('/admin/coupons');
        } catch (error) {
            req.redirect('/500');
        }
    },
    cancelCoupon: async (req, res) => {
        try {
            const { couponId } = req.body;
            await couponSchema.findOneAndUpdate({ _id: couponId }, {
                $set: {
                    status: false
                }
            });
            res.json({ cancelled: true });
        } catch (error) {
            res.redirect('/500');
        }
    },
    reactivateCoupon: async (req, res) => {
        try {
            const { couponId } = req.body;
            await couponSchema.findOneAndUpdate({ _id: couponId }, {
                $set: {
                    status: true
                }
            });
            res.json({ activated: true });
        } catch (error) {
            res.redirect('/500');
        }
    },
    //Applying the coupon in userside
    // applyCoupn:async(req,res)=>{
    //     try{
    //         const {couponCode,total}=req.body
    //         const {user}=req.session
    //         const coupon= await couponSchema.find({name:couponCode,status:true})
    //         //if coupon exists
    //         if(coupon && coupon.length>0){
    //             const now=new Date()
    //             //if coupon not expired
    //             if(coupon[0].expiryDate>= now && coupon[0].startingDate<=now){
    //                 //convert the user Ids in the users array to strings for comparisson
    //                 const userIds=coupon[0].users.map((userId)=>String((userId)))
    //                 //Check if the desired UserId is present in the array 
    //                 const userExist=userIds.includes(user)
    //                 // If user already used coupon
    //                 if(userExist){
    //                     res.json({success:false,message:"Coupon already used by the user"})
    //                 }else{
    //                     //checking the minimum Amount
    //                     if(total<coupon[0].minimumAmount){
    //                         res.json({success:false,message:"Minimum amount not reached"})
    //                     }else{
    //                         await cartSchema.updateOne({userId:user},{
    //                             $set:{
    //                                 coupon:coupon[0]._id
    //                             }
    //                         })
    //                         const cart=await cartSchema.findOne({userId:user})
    //                         let discounted
    //                         if(cart.coupon){
    //                             discounted=await couponHelper.discountPrice(cart.coupon,total)

    //                         }
    //                         res.json({success:true,message:'Available',discounted:discounted,coupona:coupon[0].minimumAmount})
    //                     }
    //                 }
    //             }else{
    //                 res.json({success:false,message:"Invalid Coupon, out Dated"})
    //             }
    //         }else{
    //             res.json({success:false,message:"Invalid Coupon"})
    //         }
    //     }catch(error){
    //         res.redirect('/500')
    //     }
    // },


    applyCoupn:async(req,res)=>{
        try{
            const {couponCode,total}=req.body
            const {user}=req.session
            const coupon= await couponSchema.find({name:couponCode,status:true})
            //if coupon exists
            if(coupon && coupon.length>0){
                const now=new Date()
                //if coupon not expired
                if(coupon[0].expiryDate>= now && coupon[0].startingDate<=now){
                    //convert the user Ids in the users array to strings for comparisson
                    const userIds=coupon[0].users.map((userId)=>String((userId)))
                    //Check if the desired UserId is present in the array 
                    const userExist=userIds.includes(user)
                    // If user already used coupon
                    if(userExist){
                        res.json({success:false,message:"Coupon already used by the user"})
                    }else{
                        //checking the minimum Amount
                        if(total<coupon[0].minimumAmount){
                            res.json({success:false,message:"Minimum amount not reached"})
                        }else{
                            await cartSchema.updateOne({userId:user},{
                                $set:{
                                    coupon:coupon[0]._id
                                }
                            })
                            const cart=await cartSchema.findOne({userId:user})
                            let discounted
                            if(cart.coupon){
                                discounted=await couponHelper.discountPrice(cart.coupon,total)

                            }
                            res.json({success:true,message:'Available',discounted:discounted,coupona:coupon[0].minimumAmount})
                        }
                    }
                }else{
                    res.json({success:false,message:"Invalid Coupon, out Dated"})
                }
            }else{
                res.json({success:false,message:"Invalid Coupon"})
            }
        }catch(error){
            res.redirect('/500')
        }
    },
    
    //Cancel the coupon in user side
    cancelCouponuser:async(req,res)=>{
            try {
                const { user } = req.session;
        
                await cartSchema.updateOne({ userId: user }, { $unset: { coupon: 1 } });
        
                res.json({ success: true, message: 'Coupon canceled successfully', });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            }
    },
   
    
}