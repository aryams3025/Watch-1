const couponSchema=require('../model/couponModel')

module.exports={
    discountPrice:async(couponId,cartTotal)=>{
        const coupon=await couponSchema.findById(couponId)
        if(!coupon){
            return{
                discountAmount:0,
                discountTotal:cartTotal
            }
        }
        let discountAmount=0;
        if(coupon.discountType ==="percentage"){
            discountAmount=(coupon.discount/100)*cartTotal;
        }else if(coupon.discountType==="fixed-amount"){
            discountAmount=coupon.discount
        }
        const discountedTotal=cartTotal-discountAmount;
        return {discountAmount,discountedTotal}
    }
}
