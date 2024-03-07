const mongoose = require('mongoose')

const Schema = mongoose.Schema
const brandSchema = Schema({
    brand : {
        type : String,
        required : true 
    },
    status : {
        type : Boolean,
        required : true,
        default : true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer' 
    }
})

module.exports = mongoose.model('brand',brandSchema)