const mongoose = require ('mongoose')

const Schema = mongoose.Schema

const couponSchema = Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    startingDate : {
        type : String,
        required : true,
    },
    expiryDate : {
        type : String,
        required : true
    },
    minimumAmount : {
        type : String,
        required : true
    },
    discount : {
        type : String,
        required : true
    },
    discountType : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        required : true ,
        default : true 
    },
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }]
})


module.exports = mongoose.model( 'coupon', couponSchema)