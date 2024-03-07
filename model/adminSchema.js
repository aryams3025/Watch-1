const mongoose = require('mongoose')

const Schema = mongoose.Schema

const adminSchema = Schema({
    // firstName : {
    //     type : String ,
    //     required : true 
    // },
    // lastName :{
    //     type : String,
    //     required : true
    // },
    email :{
        type : String,
        required : true
    },
    // mobile : {
    //     type : String,
    //     required : true
    // },

    password:{
        type:String,
        required:true
    },
    // isAdmin:{
    //     type:Number,
    //     default:1,
    // },
    // isVerified:{
    //     type:Boolean,
    //     default:false
    // },
    // token:{
    //     otp:{
    //         type:Number
    //     },
    //     generatedTime:{
    //         type:Date
    //     }
    // },
    
    // joinedDate:{
    //     type:Date,
    //     default:Date.now
    // }
})


module.exports = mongoose.model('admin',adminSchema)