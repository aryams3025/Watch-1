const couponSchema = require('../model/couponModel')

module.exports = {
    discountPrice : async(couponId,Total) =>{
        const coupon = await couponSchema.findById(couponId)
        if(!coupon){
            return {
                discountAmount : 0,
                discoutTotal : Total
            }
        }
        let discountAmount = 0 
        if(coupon.discountType === 'percentage'){
            discountAmount = (coupon.discount/100)*Total
        }else if(coupon.discountType==="fixed-amount"){
            discountAmount=coupon.discount
        }
        const discountedTotal=cartTotal-discountAmount;
        return {discountAmount,discountedTotal}
    }
}