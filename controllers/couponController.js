const couponSchema=require('../model/couponModel')
// const cartSchema=require('../models/cartModel')
const couponHelper=require('../helpers/couponHelper')


module.exports={
    //get the available coupons
    getCoupons:async(req,res)=>{
        try{
            const {search,sortData,sortOrder}=req.query
            const condition={}
            if(search){
                condition.$or=[
                    {name:{$regex:search,$options:"i"}},
                    {description:{$regex:search,$options:"i"}},
                    {descountType:{$regex:search,$options:"i"}}
                ]
            }
            const sort={}
            if(sortData){
                if(sortOrder ==='Ascending'){
                    sort[sortData]=1
                }else{
                    sort[sortData]=-1
                }
            }
            const coupons=await couponSchema.find(condition).sort(sort)
            res.render('admin/coupons',{
                admin:true,
                coupons:coupons,
                search:search,
                sortData:sortData,
                sortOrder:sortOrder
            })
        }catch(error){
            res.redirect('/500')
        }
    },
    //page for adding coupon
    getAddCoupon:(req,res)=>{
        res.render('admin/add-coupon',{
        admin:true,
        err:req.flash('err')
        })
    },
    //Adding coupon
    addCoupon:async(req,res)=>{
        try{
            const {name,description,startingDate,expiryDate,minimumAmount,discountType,discount}=req.body
            const exist=await couponSchema.findOne({name:name.toUpperCase()})
            if(exist){
                req.flash('err','Coupon name already Exists')
                return res.redirect('/admin/add-coupon')
            }
            const coupon=new couponSchema({
                name:name.toUpperCase(),
                description:description,
                startingDate:startingDate,
                expiryDate:expiryDate,
                minimumAmount:minimumAmount,
                discountType:discountType,
                discount:discount,
            })
            await coupon.save()
            res.redirect('/admin/coupons')
        }catch(error){
            res.redirect('/500')
        }
    },
    getEditCoupon:async(req,res)=>{
        try{
            const {id}=req.params
            const coupon=await couponSchema.findOne({_id:id})
            res.render('admin/edit-coupon',{
                admin:true,
                coupon:coupon
            })
        }catch(error){
            res.redirect('/500')
        }
    },
    //Edit coupon
    editCoupon:async(req,res)=>{
        try{
            const {name,description,startingDate,expiryDate,minimumAmount,discountType,discount,id}=req.body
            await couponSchema.updateOne({_id:id},{
                $set:{
                    name:name.toUpperCase(),
                    description:description,
                    startingDate:startingDate,
                    expiryDate:expiryDate,
                    minimumAmount:minimumAmount,
                    discountType:discountType,
                    discount:discount
                }
            })
            res.redirect('/admin/coupons')
        }catch(error){
            req.redirect('/500')
        }
    },
    //Cancel the coupon on admin dashboard
    cancelCoupon:async(req,res)=>{
        try{
            const {couponId}=req.body
            await couponSchema.findOneAndUpdate({_id:couponId},{
                $set:{
                    status:false
                }
            })
            res.json({cancelled:true})
        }catch(error){
            res.redirect('/500')
        }
    },
    //Reactive the coupon on admin dashboard
    ReactiveCoupon:async(req,res)=>{
        try{
            const {couponId}=req.body
            await couponSchema.findOneAndUpdate({_id:couponId},{
                $set:{
                    status:true
                }
            })
            res.json({ReActive:true})
        }catch(error){
            res.redirect('/500')
        }
    }

}